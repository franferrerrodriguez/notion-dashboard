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
        if ($userId) {
            $stmt = $pdo->prepare("SELECT external_client_id FROM client_links WHERE user_id = ?");
            $stmt->execute([$userId]);
            $link = $stmt->fetch();
            $clientId = $link['external_client_id'] ?? '';
        }

        // --- NEW: Allow Admin to "View As" another client ---
        if (isset($_GET['clientId']) && isAdmin()) {
            $clientId = $_GET['clientId'];
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

        echo json_encode(['data' => $projects, 'debug_client' => $clientId]);
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

    public function markRead($itemId) {
        $pdo = $GLOBALS['pdo'];
        $userId = $_SESSION['user_id'] ?? 0;
        $notionTime = $_GET['time'] ?? null;
        
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        if ($notionTime) {
            // Convert ISO8601 to MySQL DATETIME format
            $dbTime = date('Y-m-d H:i:s', strtotime($notionTime));
            $stmt = $pdo->prepare("INSERT INTO interaction_reads (user_id, item_id, last_read_at) 
                                   VALUES (?, ?, ?) 
                                   ON DUPLICATE KEY UPDATE last_read_at = ?");
            $stmt->execute([$userId, $itemId, $dbTime, $dbTime]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO interaction_reads (user_id, item_id, last_read_at) 
                                   VALUES (?, ?, UTC_TIMESTAMP()) 
                                   ON DUPLICATE KEY UPDATE last_read_at = UTC_TIMESTAMP()");
            $stmt->execute([$userId, $itemId]);
        }
        echo json_encode(['success' => true]);
    }

    public function markAllRead() {
        $pdo = $GLOBALS['pdo'];
        $userId = $_SESSION['user_id'] ?? 0;
        $notionTime = $_GET['time'] ?? null;

        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        if ($notionTime) {
            $dbTime = date('Y-m-d H:i:s', strtotime($notionTime));
            $stmt = $pdo->prepare("REPLACE INTO settings (`key`, `value`) VALUES (?, ?)");
            $stmt->execute(["last_mark_all_read_$userId", $dbTime]);
        } else {
            $stmt = $pdo->prepare("REPLACE INTO settings (`key`, `value`) VALUES (CONCAT('last_mark_all_read_', ?), UTC_TIMESTAMP())");
            $stmt->execute([$userId]);
        }
        
        echo json_encode(['success' => true]);
    }

    public function unreadStatus() {
        $pdo = $GLOBALS['pdo'];
        $userId = $_SESSION['user_id'] ?? 0;
        $clientId = $_GET['client_id'] ?? null;
        
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        // If clientId not provided via GET (Admin mode), fetch from mapping (Client mode)
        if (empty($clientId)) {
            $stmt = $pdo->prepare("SELECT external_client_id FROM client_links WHERE user_id = ?");
            $stmt->execute([$userId]);
            $clientId = $stmt->fetchColumn();
        }

        // Fetch DB IDs from settings
        $stmt = $pdo->query("SELECT `key`, `value` FROM settings WHERE `key` IN ('notion_database_id', 'notion_offers_database_id', 'notion_invoices_database_id', 'notion_tasks_database_id')");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $types = [
            'projects' => $settings['notion_database_id'] ?? null,
            'offers' => $settings['notion_offers_database_id'] ?? null,
            'invoices' => $settings['notion_invoices_database_id'] ?? null,
            'tasks' => $settings['notion_tasks_database_id'] ?? null,
        ];

        // Individual reads
        $stmt = $pdo->prepare("SELECT item_id, last_read_at FROM interaction_reads WHERE user_id = ?");
        $stmt->execute([$userId]);
        $reads = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Fetch global mark all as read time for this user
        $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute(["last_mark_all_read_$userId"]);
        $globalReadAt = ($stmt->fetchColumn() ?: '1970-01-01 00:00:00') . ' UTC';
        $globalReadTS = strtotime($globalReadAt);

        $unreadItems = [];
        $totalUnread = 0;
        $debugCounts = [];
        $allProjectsMap = []; // Collect everything for search matching

        foreach ($types as $type => $dbId) {
            if (!$dbId) {
                $debugCounts[$type] = 'no_db_id';
                continue;
            }
            
            $results = fetchNotionProjects($dbId, $clientId, $type, true);
            $debugItemsRaw = [];
            foreach ($results as $item) {
                $pId = $item['id'];
                $pName = $item['identification']['name'] ?? 'Sin nombre';
                $allProjectsMap[$pId] = $pName;

                $lastReadTS = strtotime(($reads[$pId] ?? '1970-01-01 00:00:00') . ' UTC');
                $maxReadAtTS = max($lastReadTS, $globalReadTS);
                $lastEditTS = strtotime($item['last_edited_time'] ?? '1970-01-01 00:00:00');

                $debugItemsRaw[] = [
                    'id' => $pId,
                    'name' => $pName,
                    'time' => $item['last_edited_time'] ?? 'null',
                    'is_unread' => ($lastEditTS > $maxReadAtTS),
                    'max_read_at' => date('Y-m-d H:i:s', $maxReadAtTS)
                ];

                if ($lastEditTS > $maxReadAtTS) {
                    $totalUnread++;
                    // Basic info for the list
                    $unreadItems[] = [
                        'id' => $pId,
                        'name' => $pName,
                        'last_edited_time' => $item['last_edited_time'],
                        'type' => $type
                    ];
                }
            }
            $debugCounts[$type] = [
                'total' => count($results),
                'items' => $debugItemsRaw
            ];
        }

        // --- GLOBAL SEARCH FALLBACK 🌐 ---
        // Catch items that don't update parent timestamp (Interactions, etc.)
        $searchResults = searchRecentNotionEdits();
        $flatInteractions = []; 
        $projectIds = array_keys($allProjectsMap);

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

            if ($isRelated) {
                // If it's an "Interacciones" page, parse it into individual entries
                if ($name === 'Interacciones' || $name === 'Interacción') {
                    $projectName = $allProjectsMap[$parentPageId] ?? $name;
                    $blocks = fetchBlocks($itemId);
                    
                    $currentDate = '';
                    $currentLines = [];
                    foreach ($blocks as $b) {
                        $bt = $b['type'];
                        $line = '';
                        if (isset($b[$bt]['rich_text'])) {
                            foreach ($b[$bt]['rich_text'] as $rt) $line .= ($rt['plain_text'] ?? '');
                        }
                        $line = trim($line);
                        if (!$line) continue;

                        // Is this line a date? (YYYY-MM-DD or DD/MM/YYYY)
                        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $line) || preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $line)) {
                            // Save previous entry if exists
                            if ($currentDate && count($currentLines) > 0) {
                                $granularId = $itemId . ':' . $currentDate;
                                $itemReadMark = strtotime(($reads[$granularId] ?? '1970-01-01 00:00:00') . ' UTC');
                                $maxReadAtTS = max($globalReadTS, $itemReadMark);
                                $isSubUnread = ($notionEditTS > $maxReadAtTS);

                                $flatInteractions[] = [
                                    'id' => $granularId,
                                    'parent_id' => $parentPageId, // NAVIGATE TO PROJECT
                                    'identification' => ['name' => mb_substr(implode("\n", $currentLines), 0, 100)],
                                    'last_edited_time' => $currentDate,
                                    'text' => implode("\n", $currentLines),
                                    'is_unread' => $isSubUnread,
                                    'type' => 'interacción'
                                ];
                            }
                            $currentDate = $line;
                            $currentLines = [];
                        } else {
                            $currentLines[] = $line;
                        }
                    }
                    // Save final entry
                    if ($currentDate && count($currentLines) > 0) {
                        $granularId = $itemId . ':' . $currentDate;
                        $itemReadMark = strtotime(($reads[$granularId] ?? '1970-01-01 00:00:00') . ' UTC');
                        $maxReadAtTS = max($globalReadTS, $itemReadMark);
                        $isSubUnread = ($notionEditTS > $maxReadAtTS);

                        $flatInteractions[] = [
                            'id' => $granularId,
                            'parent_id' => $parentPageId, // NAVIGATE TO PROJECT
                            'identification' => ['name' => mb_substr(implode("\n", $currentLines), 0, 100)],
                            'last_edited_time' => $currentDate,
                            'text' => implode("\n", $currentLines),
                            'is_unread' => $isSubUnread,
                            'type' => 'interacción'
                        ];
                    }
                }
            }
        }

        // --- FINAL COUNT CORRECTION ---
        $finalCount = 0;
        foreach ($flatInteractions as $fi) if ($fi['is_unread']) $finalCount++;

        header('Content-Type: application/json');
        echo json_encode([
            'count' => $finalCount,
            'has_unread' => $finalCount > 0,
            'items' => $flatInteractions,
            'user_id' => $userId,
            'client_id' => $clientId
        ]);
    }
}
