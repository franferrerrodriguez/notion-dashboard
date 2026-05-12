<?php
/**
 * Project Controller
 */
class ProjectController {
    public function list($databaseId, $type = 'projects') {
        $pdo = $GLOBALS['pdo'];
        $userId = $_SESSION['user_id'] ?? 0;
        
        // Default to the current user's linked client ID
        $clientId = '';

        // --- NEW: Allow Admin to "View As" another user account ---
        if (isset($_GET['viewUserId']) && isAdmin()) {
            $stmt = $pdo->prepare("SELECT external_client_id FROM client_links WHERE user_id = ?");
            $stmt->execute([$_GET['viewUserId']]);
            $clientId = $stmt->fetchColumn() ?: '';
            $userId = $_GET['viewUserId']; // Override userId for read status checks
        } elseif (isset($_GET['clientId']) && isAdmin()) {
            $clientId = $_GET['clientId'];
        } elseif ($userId) {
            $stmt = $pdo->prepare("SELECT external_client_id FROM client_links WHERE user_id = ?");
            $stmt->execute([$userId]);
            $link = $stmt->fetch();
            $clientId = $link['external_client_id'] ?? '';
        }



        if (empty($clientId)) {
            echo json_encode(['data' => [], 'message' => 'No client linked to this user']);
            exit;
        }

        $projects = fetchNotionProjects($databaseId, $clientId, $type);
        
        // --- NEW: Add unread interactions flag ---
        if (!empty($projects) && $userId) {
            // Fetch individual reads
            $stmt = $pdo->prepare("SELECT item_id, last_read_at FROM interaction_reads WHERE user_id = ?");
            $stmt->execute([$userId]);
            $reads = [];
            while ($row = $stmt->fetch()) {
                $reads[$row['item_id']] = $row['last_read_at'];
            }

            // Fetch global mark all as read time for this user
            $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
            $stmt->execute(["last_mark_all_read_$userId"]);
            $globalReadAt = ($stmt->fetchColumn() ?: '1970-01-01 00:00:00') . ' UTC';
            $globalReadTS = strtotime($globalReadAt);

            foreach ($projects as &$p) {
                $lastReadTS = strtotime(($reads[$p['id']] ?? '1970-01-01 00:00:00') . ' UTC');
                $maxReadTS = max($lastReadTS, $globalReadTS);
                $lastEditTS = strtotime($p['last_edited_time'] ?? '1970-01-01 00:00:00');
                
                $p['has_unread_interactions'] = $lastEditTS > $maxReadTS;
            }
        }

        if (empty($projects) && isset($_SESSION['last_notion_error'])) {
             echo json_encode(['error' => $_SESSION['last_notion_error'], 'clientId' => $clientId, 'debug_type' => $type]);
             exit;
        }

        // Fetch client logo if available
        $stmt = $pdo->prepare("SELECT DISTINCT logo_url FROM client_links WHERE external_client_id = ? LIMIT 1");
        $stmt->execute([$clientId]);
        $logoUrl = $stmt->fetchColumn();

        echo json_encode([
            'data' => $projects, 
            'debug_client' => $clientId,
            'client_logo' => $logoUrl
        ]);
    }

    public function detail($projectId) {
        $detail = fetchNotionPageDetail($projectId);
        if ($detail) {
            $pdo = $GLOBALS['pdo'];
            $userId = $_SESSION['user_id'] ?? 0;
            $detail['has_unread_interactions'] = false;
            
            if ($userId) {
                // Fetch individual
                $stmt = $pdo->prepare("SELECT last_read_at FROM interaction_reads WHERE user_id = ? AND item_id = ?");
                $stmt->execute([$userId, $projectId]);
                $lastReadTS = strtotime(($stmt->fetchColumn() ?: '1970-01-01 00:00:00') . ' UTC');

                // Fetch global
                $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
                $stmt->execute(["last_mark_all_read_$userId"]);
                $globalReadTS = strtotime(($stmt->fetchColumn() ?: '1970-01-01 00:00:00') . ' UTC');

                $maxReadTS = max($lastReadTS, $globalReadTS);
                $lastEditTS = strtotime($detail['last_edited_time'] ?? '1970-01-01 00:00:00');
                
                $detail['has_unread_interactions'] = $lastEditTS > $maxReadTS;
            }

            echo json_encode($detail);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
        }
    }
    public function detailTasks($projectId) {
        $data = fetchProjectTasks($projectId);
        echo json_encode($data);
    }

    public function detailInteractions($projectId) {
        $data = fetchProjectInteractions($projectId);
        echo json_encode($data);
    }

    public function detailDeliveries($projectId) {
        $data = fetchProjectDeliveries($projectId);
        echo json_encode($data);
    }

    public function detailContacts($projectId) {
        $data = fetchProjectContacts($projectId);
        echo json_encode($data);
    }

    public function markRead($itemId) {
        $pdo = $GLOBALS['pdo'];
        $userId = $_SESSION['user_id'] ?? 0;
        
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        // We use the itemId exactly as provided.
        // For interactions, it's 'notion_id:date'.
        // For projects, it's just 'notion_id'.
        $stmt = $pdo->prepare("INSERT INTO interaction_reads (user_id, item_id, last_read_at) 
                               VALUES (?, ?, UTC_TIMESTAMP()) 
                               ON DUPLICATE KEY UPDATE last_read_at = UTC_TIMESTAMP()");
        $stmt->execute([$userId, $itemId]);

        echo json_encode(['success' => true, 'id_marked' => $itemId]);
    }

    public function markAllRead() {
        $pdo = $GLOBALS['pdo'];
        $userId = $_SESSION['user_id'] ?? 0;
        $clientId = $_GET['client_id'] ?? null;

        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        // Fetch unread items using our shared logic
        $status = $this->getUnreadStatusItems($userId, $clientId);
        $items = $status['items'] ?? [];
        
        $markedCount = 0;
        foreach ($items as $item) {
            if ($item['is_unread']) {
                $stmt = $pdo->prepare("REPLACE INTO interaction_reads (user_id, item_id, last_read_at) VALUES (?, ?, UTC_TIMESTAMP())");
                $stmt->execute([$userId, $item['id']]);
                $markedCount++;
            }
        }

        echo json_encode(['success' => true, 'marked' => $markedCount]);
    }

    public function unreadStatus() {
        $userId = $_SESSION['user_id'] ?? 0;
        $clientId = $_GET['client_id'] ?? null;
        $viewUserId = $_GET['viewUserId'] ?? null;

        if ($viewUserId && isAdmin()) {
            $userId = $viewUserId;
            $clientId = null; // Let the helper find the client_id for this specific user
        }
        
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $result = $this->getUnreadStatusItems($userId, $clientId);
        header('Content-Type: application/json');
        echo json_encode($result);
    }

    private function getUnreadStatusItems($userId, $clientId = null) {
        $pdo = $GLOBALS['pdo'];
        
        if (empty($clientId)) {
            $stmt = $pdo->prepare("SELECT external_client_id FROM client_links WHERE user_id = ?");
            $stmt->execute([$userId]);
            $clientId = $stmt->fetchColumn();
        }

        // Fetch DB IDs from settings
        $stmt = $pdo->query("SELECT `key`, `value` FROM settings WHERE `key` IN ('notion_projects_database_id', 'notion_offers_database_id', 'notion_invoices_database_id', 'notion_tasks_database_id')");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $types = [
            'projects' => $settings['notion_projects_database_id'] ?? null,
            'offers' => $settings['notion_offers_database_id'] ?? null,
            'invoices' => $settings['notion_invoices_database_id'] ?? null,
            'tasks' => $settings['notion_tasks_database_id'] ?? null,
        ];

        // Individual reads (remove globalReadTS dependency)
        $stmt = $pdo->prepare("SELECT item_id, last_read_at FROM interaction_reads WHERE user_id = ?");
        $stmt->execute([$userId]);
        $reads = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $unreadItems = [];
        $allProjectsMap = []; // Collect everything for search matching

        foreach ($types as $type => $dbId) {
            if (!$dbId) continue;
            
            $results = fetchNotionProjects($dbId, $clientId, $type, true);
            foreach ($results as $item) {
                $pId = $item['id'];
                $pName = $item['identification']['name'] ?? 'Sin nombre';
                $allProjectsMap[$pId] = $pName;
                // DO NOT add to unreadItems - user only wants interactions
            }
        }

        // --- GLOBAL SEARCH FALLBACK 🌐 ---
        $searchResults = searchRecentNotionEdits();
        $flatInteractions = []; 
        $projectIds = array_keys($allProjectsMap);
        
        // Prepare project names map for easier lookup
        $projectNamesMap = [];
        foreach ($allProjectsMap as $pid => $pname) {
            $projectNamesMap[$pid] = $pname;
        }

        foreach ($searchResults as $item) {
            if ($item['object'] === 'database') continue;
            
            $itemId = $item['id'];
            $notionEditTS = strtotime($item['last_edited_time'] ?? '1970-01-01 00:00:00');
            $parentPageId = $item['parent']['page_id'] ?? null;
            
            // Name Extraction
            $name = '';
            foreach ($item['properties'] ?? [] as $p) {
                if (($p['type'] ?? '') === 'title') { $name = $p['title'][0]['plain_text'] ?? ''; break; }
            }
            if (!$name) $name = $item['properties']['Name']['title'][0]['plain_text'] ?? 'Sin título';

            // Check Relation to Projects
            $isRelated = in_array($itemId, $projectIds) || ($parentPageId && in_array($parentPageId, $projectIds));
            if (!$isRelated) {
                foreach ($item['properties'] ?? [] as $prop) {
                    if (($prop['type'] ?? '') === 'relation') {
                        foreach ($prop['relation'] ?? [] as $rel) {
                            if (in_array($rel['id'], $projectIds)) { $isRelated = true; break 2; }
                        }
                    }
                    if (($prop['type'] ?? '') === 'multi_select' || ($prop['type'] ?? '') === 'select') {
                        $pValues = $prop['multi_select'] ?? [$prop['select'] ?? []];
                        foreach ($pValues as $v) {
                            if (($v['name'] ?? '') === $clientId) { $isRelated = true; break 2; }
                        }
                    }
                }
            }

            if ($isRelated && ($name === 'Interacciones' || $name === 'Interacción')) {
                // Determine the project name for this interaction set
                $projectName = 'Proyecto';
                if ($parentPageId && isset($projectNamesMap[$parentPageId])) {
                    $projectName = $projectNamesMap[$parentPageId];
                } else {
                    // Fallback to searching relations if parent isn't the project itself
                    foreach ($item['properties'] ?? [] as $prop) {
                        if (($prop['type'] ?? '') === 'relation') {
                            foreach ($prop['relation'] ?? [] as $rel) {
                                if (isset($projectNamesMap[$rel['id']])) {
                                    $projectName = $projectNamesMap[$rel['id']];
                                    break 2;
                                }
                            }
                        }
                    }
                }

                $blocks = fetchBlocks($itemId);
                $currentDate = ''; $currentLines = [];
                
                foreach ($blocks as $b) {
                    $bt = $b['type']; $line = '';
                    if (isset($b[$bt]['rich_text'])) {
                        foreach ($b[$bt]['rich_text'] as $rt) $line .= ($rt['plain_text'] ?? '');
                    }
                    $line = trim($line);
                    if (!$line) continue;

                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $line) || preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $line)) {
                        if ($currentDate && count($currentLines) > 0) {
                            $text = implode("\n", $currentLines);
                            // Generate a short hash of the text to ensure uniqueness 
                            // if there are multiple interactions on the same day.
                            $textHash = substr(dechex(crc32($text)), 0, 8);
                            $granularId = $itemId . ':' . $currentDate . ':' . $textHash;

                            // Simply check if this specific interaction ID exists in our reads table
                            $isSubUnread = !isset($reads[$granularId]);

                            $flatInteractions[] = [
                                'id' => $granularId,
                                'parent_id' => $parentPageId,
                                'project_name' => $projectName,
                                'identification' => ['name' => mb_substr($text, 0, 100)],
                                'last_edited_time' => $currentDate,
                                'text' => $text,
                                'is_unread' => $isSubUnread,
                                'type' => 'interacción'
                            ];
                        }
                        $currentDate = $line; $currentLines = [];
                    } else { $currentLines[] = $line; }
                }
                if ($currentDate && count($currentLines) > 0) {
                    $text = implode("\n", $currentLines);
                    $textHash = substr(dechex(crc32($text)), 0, 8);
                    $granularId = $itemId . ':' . $currentDate . ':' . $textHash;
                    
                    // Simply check if this specific interaction ID exists in our reads table
                    $isSubUnread = !isset($reads[$granularId]);

                    $flatInteractions[] = [
                        'id' => $granularId,
                        'parent_id' => $parentPageId,
                        'project_name' => $projectName,
                        'identification' => ['name' => mb_substr($text, 0, 100)],
                        'last_edited_time' => $currentDate,
                        'text' => $text,
                        'is_unread' => $isSubUnread,
                        'type' => 'interacción'
                    ];
                }
            }
        }

        // Merging and final count (unreadItems is empty by policy now)
        $allItems = $flatInteractions;
        $finalCount = 0;
        foreach ($allItems as $fi) if ($fi['is_unread']) $finalCount++;

        return [
            'count' => $finalCount,
            'has_unread' => $finalCount > 0,
            'items' => $allItems,
            'user_id' => $userId,
            'client_id' => $clientId
        ];
    }
}
