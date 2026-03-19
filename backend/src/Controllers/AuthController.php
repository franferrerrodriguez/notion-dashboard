<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use PDO;

class AuthController {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function login(Request $request, Response $response) {
        $data = $request->getParsedBody();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            $response->getBody()->write(json_encode(['error' => 'Email and password required']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $stmt = $this->db->prepare("
            SELECT u.*, r.name as role_name, cl.external_client_id 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            LEFT JOIN client_links cl ON u.id = cl.user_id 
            WHERE u.email = ? AND u.is_active = 1
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Update last login
            $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

            // Set Session
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role_name'];
            $_SESSION['external_client_id'] = $user['external_client_id'];

            unset($user['password_hash']);
            $response->getBody()->write(json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'role' => $user['role_name'],
                    'external_client_id' => $user['external_client_id']
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Invalid credentials']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }

    public function logout(Request $request, Response $response) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function me(Request $request, Response $response) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $stmt = $this->db->prepare("
            SELECT u.id, u.email, r.name as role, cl.external_client_id 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            LEFT JOIN client_links cl ON u.id = cl.user_id 
            WHERE u.id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
