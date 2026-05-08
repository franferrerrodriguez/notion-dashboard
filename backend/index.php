<?php
/**
 * Main API Entry Point - Notion-Client Dashboard (Full Admin Support)
 */
require_once __DIR__ . '/config/secrets.php';
require_once __DIR__ . '/src/Services/NotionService.php';
require_once __DIR__ . '/src/Controllers/ProjectController.php';
require_once __DIR__ . '/src/Controllers/AppController.php';
require_once __DIR__ . '/src/Controllers/FileController.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (\PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

function getSetting($pdo, $key, $default = '') {
    $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    return $row ? $row['value'] : $default;
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start([
    'cookie_httponly' => true,
    'cookie_secure' => true, 
    'use_only_cookies' => true,
    'cookie_samesite' => 'None',
]);

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Load Notion Config ONLY from DB
define('NOTION_API_KEY', getSetting($pdo, 'notion_integration_token', ''));
define('NOTION_PROJECTS_DATABASE_ID', getSetting($pdo, 'notion_projects_database_id', ''));
define('NOTION_OFFERS_DATABASE_ID', getSetting($pdo, 'notion_offers_database_id', ''));
define('NOTION_INVOICES_DATABASE_ID', getSetting($pdo, 'notion_invoices_database_id', ''));
define('NOTION_TASKS_DATABASE_ID', getSetting($pdo, 'notion_tasks_database_id', ''));

// --- CONFIGURATION GUARD ---
// Define which actions are "safe" to run even without configuration
$safe_actions = ['login', 'logout', 'me', 'settings_save']; 
$config_error = (
    empty(NOTION_API_KEY) || 
    empty(NOTION_PROJECTS_DATABASE_ID) ||
    empty(NOTION_OFFERS_DATABASE_ID) ||
    empty(NOTION_INVOICES_DATABASE_ID) ||
    empty(NOTION_TASKS_DATABASE_ID)
);

if ($config_error && !in_array($action, $safe_actions)) {
    http_response_code(412); // Precondition Failed
    echo json_encode([
        'error' => 'Configuration Missing',
        'message' => 'Uno o más IDs de Notion no están configurados en los ajustes.',
        'needs_setup' => true
    ]);
    exit;
}

function isAdmin() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Admin';
}

$projectController = new ProjectController();
$appController = new AppController($pdo);
$fileController = new FileController($pdo);

// --- SETTINGS (ADMIN ONLY) ---
if ($action === 'settings_get' && $method === 'GET') {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    $stmt = $pdo->query("SELECT `key`, `value` FROM settings");
    $settings = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $settings[$row['key']] = $row['value'];
    }
    echo json_encode($settings);
    exit;
}

if ($action === 'settings_save' && $method === 'POST') {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Map frontend keys to database keys
    $mappings = [
        'notion_token' => 'notion_integration_token',
        'notion_projects_database_id' => 'notion_projects_database_id',
        'offers_database_id' => 'notion_offers_database_id',
        'invoices_database_id' => 'notion_invoices_database_id',
        'tasks_database_id' => 'notion_tasks_database_id'
    ];

    $pdo->beginTransaction();
    try {
        foreach ($input as $key => $value) {
            $dbKey = $mappings[$key] ?? $key;
            // Use INSERT ... ON DUPLICATE KEY UPDATE for robust saving
            $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) 
                                   VALUES (?, ?) 
                                   ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
            $stmt->execute([$dbKey, preg_replace('/\s+/', '', $value)]);
        }
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// --- AUTH ---
if ($action === 'login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("
        SELECT u.*, r.name as role_name, cl.external_client_id, cl.logo_url 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        LEFT JOIN client_links cl ON u.id = cl.user_id
        WHERE u.email = ? AND u.is_active = 1
    ");
    $stmt->execute([$input['email'] ?? '']);
    $user = $stmt->fetch();
    if ($user && password_verify($input['password'] ?? '', $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role_name'];
        echo json_encode([
            'success' => true, 
            'user' => [
                'id' => $user['id'], 
                'email' => $user['email'], 
                'role' => $user['role_name'],
                'external_client_id' => $user['external_client_id'],
                'logo_url' => $user['logo_url']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'me') {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, r.name as role, cl.external_client_id, cl.logo_url
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            LEFT JOIN client_links cl ON u.id = cl.user_id
            WHERE u.id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        echo json_encode($stmt->fetch());
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
    }
    exit;
}

if ($action === 'profile_update_password' && $method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Password is required']);
        exit;
    }
    $hash = password_hash($input['password'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$hash, $_SESSION['user_id']]);
    echo json_encode(['success' => true]);
    exit;
}

// --- APPS & FILES ---
if ($action === 'apps_all' && $method === 'GET') {
    $appController->listAll();
    exit;
}

if ($action === 'apps_user' && $method === 'GET') {
    $userId = $_GET['user_id'] ?? $_SESSION['user_id'] ?? null;
    $externalClientId = $_GET['external_client_id'] ?? null;
    
    if (!$userId && !$externalClientId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID or External Client ID required']);
        exit;
    }
    $appController->listForUser($userId, $externalClientId);
    exit;
}

if ($action === 'files_user' && $method === 'GET') {
    $userId = $_GET['user_id'] ?? $_SESSION['user_id'] ?? null;
    $externalClientId = $_GET['external_client_id'] ?? null;

    if (!$userId && !$externalClientId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID or External Client ID required']);
        exit;
    }
    $fileController->listForUser($userId, $externalClientId);
    exit;
}

if ($action === 'files_upload' && $method === 'POST') {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    $fileController->upload();
    exit;
}

if ($action === 'files_delete' && $method === 'DELETE' && isset($_GET['id'])) {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    $fileController->delete($_GET['id']);
    exit;
}

if ($action === 'files_download' && isset($_GET['id'])) {
    $fileController->download($_GET['id']);
    exit;
}

// --- USERS (ADMIN ONLY) ---
if (strpos($action, 'users') === 0) {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }

    if ($action === 'users_list' && $method === 'GET') {
        $stmt = $pdo->query("
            SELECT u.id, u.email, u.is_active, u.last_login, r.name as role, cl.external_client_id, cl.logo_url,
                   (SELECT GROUP_CONCAT(app_id) FROM user_apps WHERE user_id = u.id) as app_ids
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            LEFT JOIN client_links cl ON u.id = cl.user_id 
            ORDER BY u.id DESC
        ");
        $users = $stmt->fetchAll();
        foreach ($users as &$u) {
            $u['app_ids'] = $u['app_ids'] ? array_map('intval', explode(',', $u['app_ids'])) : [];
        }
        echo json_encode($users);
        exit;
    }

    if ($action === 'users_create' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $hash = password_hash($input['password'], PASSWORD_DEFAULT);
        $pdo->beginTransaction();
        try {
            $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
            $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?)");
            $stmt->execute([$input['email'], $hash, $input['role_id'], $isActive]);
            $userId = $pdo->lastInsertId();
            if (!empty($input['external_client_id'])) {
                $stmt = $pdo->prepare("INSERT INTO client_links (user_id, external_client_id, logo_url) VALUES (?, ?, ?)");
                $stmt->execute([$userId, $input['external_client_id'], $input['logo_url'] ?? null]);
            }
            if (!empty($input['app_ids'])) {
                $stmt = $pdo->prepare("INSERT INTO user_apps (user_id, app_id) VALUES (?, ?)");
                foreach ($input['app_ids'] as $appId) {
                    $stmt->execute([$userId, $appId]);
                }
            }
            $pdo->commit();
            echo json_encode(['success' => true, 'id' => $userId]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'users_update' && $method === 'PUT' && isset($_GET['id'])) {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'];
        
        // Fetch current user details to check for root protection
        $stmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $currentUser = $stmt->fetch();

        $pdo->beginTransaction();
        try {
            if ($currentUser && $currentUser['email'] === 'root@root.com') {
                // If it's root, allow password and app updates
                if (!empty($input['password'])) {
                    $hash = password_hash($input['password'], PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
                    $stmt->execute([$hash, $id]);
                }
                
                // Update Apps for root too
                $stmt = $pdo->prepare("DELETE FROM user_apps WHERE user_id = ?");
                $stmt->execute([$id]);
                if (!empty($input['app_ids'])) {
                    $stmt = $pdo->prepare("INSERT INTO user_apps (user_id, app_id) VALUES (?, ?)");
                    foreach ($input['app_ids'] as $appId) {
                        $stmt->execute([$id, $appId]);
                    }
                }
            } else {
                // Standard User Update
                $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
                $stmt = $pdo->prepare("UPDATE users SET email = ?, role_id = ?, is_active = ? WHERE id = ?");
                $stmt->execute([$input['email'], $input['role_id'], $isActive, $id]);
                
                // Optional Password Update
                if (!empty($input['password'])) {
                    $hash = password_hash($input['password'], PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
                    $stmt->execute([$hash, $id]);
                }

                // Update Client Mapping (Upsert style)
                $stmt = $pdo->prepare("DELETE FROM client_links WHERE user_id = ?");
                $stmt->execute([$id]);
                if (!empty($input['external_client_id'])) {
                    $stmt = $pdo->prepare("INSERT INTO client_links (user_id, external_client_id, logo_url) VALUES (?, ?, ?)");
                    $stmt->execute([$id, $input['external_client_id'], $input['logo_url'] ?? null]);
                }

                // Update Apps
                $stmt = $pdo->prepare("DELETE FROM user_apps WHERE user_id = ?");
                $stmt->execute([$id]);
                if (!empty($input['app_ids'])) {
                    $stmt = $pdo->prepare("INSERT INTO user_apps (user_id, app_id) VALUES (?, ?)");
                    foreach ($input['app_ids'] as $appId) {
                        $stmt->execute([$id, $appId]);
                    }
                }
            }
            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'users_delete' && $method === 'DELETE' && isset($_GET['id'])) {
        // Prevent deletion of root user
        $stmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $user = $stmt->fetch();
        
        if ($user && $user['email'] === 'root@root.com') {
            http_response_code(403);
            echo json_encode(['error' => 'Root user cannot be deleted']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
}

// --- PROJECTS / OFFERS / INVOICES ---
if ($action === 'list') {
    $type = $_GET['type'] ?? 'projects';
    $dbId = NOTION_PROJECTS_DATABASE_ID;
    
    if ($type === 'offers') $dbId = NOTION_OFFERS_DATABASE_ID;
    if ($type === 'invoices') $dbId = NOTION_INVOICES_DATABASE_ID;
    if ($type === 'tasks') $dbId = NOTION_TASKS_DATABASE_ID;

    if (empty($dbId)) {
        http_response_code(412);
        echo json_encode(['error' => 'Database ID not configured for ' . $type]);
        exit;
    }

    $projectController->list($dbId, $type);
    exit;
}
if ($action === 'detail' && isset($_GET['id'])) {
    $projectController->detail($_GET['id']);
    exit;
}
if ($action === 'detail_tasks' && isset($_GET['id'])) {
    $projectController->detailTasks($_GET['id']);
    exit;
}
if ($action === 'detail_interactions' && isset($_GET['id'])) {
    $projectController->detailInteractions($_GET['id']);
    exit;
}
if ($action === 'detail_deliveries' && isset($_GET['id'])) {
    $projectController->detailDeliveries($_GET['id']);
    exit;
}
if ($action === 'detail_contacts' && isset($_GET['id'])) {
    $projectController->detailContacts($_GET['id']);
    exit;
}
if ($action === 'mark_read' && isset($_GET['id']) && $method === 'POST') {
    $projectController->markRead($_GET['id']);
    exit;
}
if ($action === 'mark_all_read' && $method === 'POST') {
    $projectController->markAllRead();
    exit;
}
if ($action === 'unread_status') {
    $projectController->unreadStatus();
    exit;
}
if ($action === 'client_info') {
    $clientId = $_GET['client_id'] ?? null;
    if (empty($clientId) && isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT external_client_id FROM client_links WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $clientId = $stmt->fetchColumn();
    }
    
    if ($clientId) {
        $stmt = $pdo->prepare("SELECT external_client_id as id, logo_url FROM client_links WHERE external_client_id = ? LIMIT 1");
        $stmt->execute([$clientId]);
        echo json_encode($stmt->fetch() ?: ['id' => $clientId, 'logo_url' => null]);
    } else {
        echo json_encode(['error' => 'No client found']);
    }
    exit;
}
if ($action === 'client_options') {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    $options = fetchNotionClientOptions(NOTION_PROJECTS_DATABASE_ID);
    echo json_encode($options);
    exit;
}
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
