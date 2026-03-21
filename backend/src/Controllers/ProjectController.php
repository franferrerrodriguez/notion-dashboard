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
        $stmt = $pdo->query("SELECT `key`, `value` FROM settings WHERE `key` IN ('notion_projects_db_id', 'notion_offers_db_id', 'notion_invoices_db_id', 'notion_tasks_db_id')");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $types = [
            'projects' => $settings['notion_projects_db_id'] ?? null,
            'offers' => $settings['notion_offers_db_id'] ?? null,
            'invoices' => $settings['notion_invoices_db_id'] ?? null,
            'tasks' => $settings['notion_tasks_db_id'] ?? null,
        ];

        // Global read mark
        $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute(["last_mark_all_read_$userId"]);
        $globalReadTS = strtotime(($stmt->fetchColumn() ?: '1970-01-01 00:00:00') . ' UTC');

        // Individual reads
        $stmt = $pdo->prepare("SELECT item_id, last_read_at FROM interaction_reads WHERE user_id = ?");
        $stmt->execute([$userId]);
        $reads = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $unreadItems = [];
        $totalUnread = 0;

        foreach ($types as $type => $dbId) {
            if (!$dbId) continue;
            
            $results = fetchNotionProjects($dbId, $clientId, $type);
            foreach ($results as $item) {
                $lastReadTS = strtotime(($reads[$item['id']] ?? '1970-01-01 00:00:00') . ' UTC');
                $maxReadAtTS = max($lastReadTS, $globalReadTS);
                $lastEditTS = strtotime($item['last_edited_time'] ?? '1970-01-01 00:00:00');

                if ($lastEditTS > $maxReadAtTS) {
                    $totalUnread++;
                    // Basic info for the list
                    $unreadItems[] = [
                        'id' => $item['id'],
                        'name' => $item['identification']['name'] ?? 'Sin nombre',
                        'last_edited_time' => $item['last_edited_time'],
                        'type' => $type
                    ];
                }
            }
        }

        header('Content-Type: application/json');
        echo json_encode([
            'count' => $totalUnread,
            'has_unread' => $totalUnread > 0,
            'items' => $unreadItems,
            '_debug' => [
                'user_id' => $userId,
                'client_id' => $clientId,
                'global_read_ts' => date('Y-m-d H:i:s', $globalReadTS),
                'now_utc' => gmdate('Y-m-d H:i:s'),
                'checked_count' => count($unreadItems) + ($totalUnread > 0 ? 0 : 0) // Just to have something
            ]
        ]);
    }
}
