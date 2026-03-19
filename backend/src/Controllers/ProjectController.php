<?php
/**
 * Project Controller
 */
class ProjectController {
    public function list($databaseId) {
        $pdo = $GLOBALS['pdo']; // Assume PDO is available globally or injected
        
        // Default to the current user's linked client ID
        $clientId = '';
        if (isset($_SESSION['user_id'])) {
            $stmt = $pdo->prepare("SELECT external_client_id FROM client_links WHERE user_id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $link = $stmt->fetch();
            $clientId = $link['external_client_id'] ?? '';
        }

        // --- NEW: Allow Admin to "View As" another client ---
        if (isset($_GET['clientId']) && isAdmin()) {
            $clientId = $_GET['clientId'];
        }

        if (empty($clientId)) {
            // If No client linked and not admin forcing one, return empty
            echo json_encode(['data' => [], 'message' => 'No client linked to this user']);
            exit;
        }

        $projects = fetchNotionProjects($databaseId, $clientId);
        
        // Debug: if empty, show why
        if (empty($projects) && isset($_SESSION['last_notion_error'])) {
             echo json_encode(['error' => $_SESSION['last_notion_error'], 'clientId' => $clientId]);
             exit;
        }

        echo json_encode(['data' => $projects, 'debug_client' => $clientId]);
    }

    public function detail($projectId) {
        $detail = fetchNotionPageDetail($projectId);
        if ($detail) {
            echo json_encode($detail);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
        }
    }
}
