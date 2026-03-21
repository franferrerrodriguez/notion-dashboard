<?php
/**
 * Main API Entry Point - Notion-Client Dashboard (Full Admin Support)
 */
require_once __DIR__ . '/config/secrets.php';
require_once __DIR__ . '/src/Services/NotionService.php';
require_once __DIR__ . '/src/Controllers/ProjectController.php';

session_start([
    'cookie_httponly' => true,
    'cookie_secure' => true, 
    'use_only_cookies' => true,
    'cookie_samesite' => 'None',
]);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:5173', 'https://info.frandiabolo.es', 'http://info.frandiabolo.es'];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://info.frandiabolo.es");
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// --- SETTINGS HELPER ---
function getSetting($pdo, $key, $default = '') {
    $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    return $row ? $row['value'] : $default;
}

// Load Notion Config ONLY from DB
define('NOTION_API_KEY', getSetting($pdo, 'notion_integration_token', ''));
define('NOTION_DATABASE_ID', getSetting($pdo, 'notion_database_id', '329b2935ab688045ae4cd0f7143b595c'));
define('NOTION_OFFERS_DATABASE_ID', getSetting($pdo, 'notion_offers_database_id', '30ab2935ab6880518f79f8e6c6b3c5e2'));
define('NOTION_INVOICES_DATABASE_ID', getSetting($pdo, 'notion_invoices_database_id', '30bb2935ab68802dbf6fc7f546228475'));
define('NOTION_TASKS_DATABASE_ID', getSetting($pdo, 'notion_tasks_database_id', '30ab2935ab68811c8edcea5820d644ac'));

// --- CONFIGURATION GUARD ---
// Define which actions are "safe" to run even without configuration
$safe_actions = ['login', 'logout', 'me', 'settings_save']; 
$config_error = (empty(NOTION_API_KEY) || empty(NOTION_DATABASE_ID));

if ($config_error && !in_array($action, $safe_actions)) {
    http_response_code(412); // Precondition Failed
    echo json_encode([
        'error' => 'Configuration Missing',
        'message' => 'Notion API Key or Database ID not found in database settings.',
        'needs_setup' => true
    ]);
    exit;
}

function isAdmin() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Admin';
}

$projectController = new ProjectController();

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
        'database_id'  => 'notion_database_id',
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
    $stmt = $pdo->prepare("SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.is_active = 1");
    $stmt->execute([$input['email'] ?? '']);
    $user = $stmt->fetch();
    if ($user && password_verify($input['password'] ?? '', $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role_name'];
        echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role_name']]]);
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
            SELECT u.id, u.email, r.name as role, cl.external_client_id
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

// --- USERS (ADMIN ONLY) ---
if (strpos($action, 'users') === 0) {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }

    if ($action === 'users_list' && $method === 'GET') {
        $stmt = $pdo->query("
            SELECT u.id, u.email, u.is_active, u.last_login, r.name as role, cl.external_client_id 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            LEFT JOIN client_links cl ON u.id = cl.user_id 
            ORDER BY u.id DESC
        ");
        echo json_encode($stmt->fetchAll());
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
                $stmt = $pdo->prepare("INSERT INTO client_links (user_id, external_client_id) VALUES (?, ?)");
                $stmt->execute([$userId, $input['external_client_id']]);
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
                // If it's root, ONLY allow password update if provided, ignore email/role changes
                if (!empty($input['password'])) {
                    $hash = password_hash($input['password'], PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
                    $stmt->execute([$hash, $id]);
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
                    $stmt = $pdo->prepare("INSERT INTO client_links (user_id, external_client_id) VALUES (?, ?)");
                    $stmt->execute([$id, $input['external_client_id']]);
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
    $dbId = NOTION_DATABASE_ID;
    
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
if ($action === 'client_options') {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    $options = fetchNotionClientOptions(NOTION_DATABASE_ID);
    echo json_encode($options);
    exit;
}
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
