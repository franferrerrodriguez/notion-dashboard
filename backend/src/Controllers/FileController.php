<?php

class FileController {
    private $pdo;
    private $uploadDir;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        // Se sube 2 niveles más sobre la ruta anterior (__DIR__ . '/../../uploads/')
        // __DIR__ es backend/src/Controllers
        // ../../../.. llega a la carpeta raíz del proyecto o superior según se necesite
        $this->uploadDir = __DIR__ . '/../../../../uploads/';
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    public function listForUser($userId, $externalClientId = null) {
        if ($externalClientId) {
            $stmt = $this->pdo->prepare("
                SELECT uf.* 
                FROM user_files uf
                JOIN client_links cl ON uf.user_id = cl.user_id
                WHERE cl.external_client_id = ?
                ORDER BY uf.uploaded_at DESC
            ");
            $stmt->execute([$externalClientId]);
        } else {
            $stmt = $this->pdo->prepare("SELECT * FROM user_files WHERE user_id = ? ORDER BY uploaded_at DESC");
            $stmt->execute([$userId]);
        }
        echo json_encode($stmt->fetchAll());
    }

    public function upload() {
        if (!isset($_FILES['file']) || !isset($_POST['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing file or user_id']);
            return;
        }

        $userId = $_POST['user_id'];
        $category = $_POST['category'] ?? 'General';
        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(500);
            echo json_encode(['error' => 'File upload error code: ' . $file['error']]);
            return;
        }

        // Ensure user directory exists
        $userDir = $this->uploadDir . $userId . '/';
        if (!is_dir($userDir)) {
            mkdir($userDir, 0777, true);
        }

        $originalName = $file['name'];
        $ext = pathinfo($originalName, PATHINFO_EXTENSION);
        $filename = uniqid('file_', true) . '.' . $ext;
        $targetPath = $userDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $stmt = $this->pdo->prepare("
                INSERT INTO user_files (user_id, filename, original_name, file_path, file_type, file_size, category) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $filename,
                $originalName,
                'uploads/' . $userId . '/' . $filename,
                $file['type'],
                $file['size'],
                $category
            ]);
            echo json_encode(['success' => true, 'id' => $this->pdo->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to move uploaded file']);
        }
    }

    public function delete($fileId) {
        $stmt = $this->pdo->prepare("SELECT * FROM user_files WHERE id = ?");
        $stmt->execute([$fileId]);
        $file = $stmt->fetch();

        if ($file) {
            $filePath = $this->uploadDir . $file['user_id'] . '/' . $file['filename'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            $stmt = $this->pdo->prepare("DELETE FROM user_files WHERE id = ?");
            $stmt->execute([$fileId]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'File not found']);
        }
    }

    public function download($fileId) {
        $stmt = $this->pdo->prepare("SELECT * FROM user_files WHERE id = ?");
        $stmt->execute([$fileId]);
        $file = $stmt->fetch();

        if ($file) {
            $filePath = $this->uploadDir . $file['user_id'] . '/' . $file['filename'];
            if (file_exists($filePath)) {
                header('Content-Description: File Transfer');
                header('Content-Type: ' . $file['file_type']);
                header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($filePath));
                readfile($filePath);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
    }
}
