<?php

class AppController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function listAll() {
        $stmt = $this->pdo->query("SELECT * FROM apps ORDER BY name ASC");
        echo json_encode($stmt->fetchAll());
    }

    public function listForUser($userId, $externalClientId = null) {
        if ($externalClientId) {
            $stmt = $this->pdo->prepare("
                SELECT a.* 
                FROM apps a
                JOIN user_apps ua ON a.id = ua.app_id
                JOIN client_links cl ON ua.user_id = cl.user_id
                WHERE cl.external_client_id = ?
            ");
            $stmt->execute([$externalClientId]);
        } else {
            $stmt = $this->pdo->prepare("
                SELECT a.* 
                FROM apps a
                JOIN user_apps ua ON a.id = ua.app_id
                WHERE ua.user_id = ?
            ");
            $stmt->execute([$userId]);
        }
        echo json_encode($stmt->fetchAll());
    }

    public function updateForUser($userId, $appIds) {
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare("DELETE FROM user_apps WHERE user_id = ?");
            $stmt->execute([$userId]);

            if (!empty($appIds)) {
                $stmt = $this->pdo->prepare("INSERT INTO user_apps (user_id, app_id) VALUES (?, ?)");
                foreach ($appIds as $appId) {
                    $stmt->execute([$userId, $appId]);
                }
            }
            $this->pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $this->pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
