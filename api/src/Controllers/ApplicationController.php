<?php

namespace App\Controllers;

use PDO;
use App\Utils\Response;

class ApplicationController
{
    public static function submit(PDO $pdo, string $type, array $payload): void
    {
        $required = ['firstName','lastName','email','phone','city'];
        foreach ($required as $field) {
            if (empty($payload[$field])) {
                Response::error(422, 'Başvuru bilgileri eksik.');
            }
        }
        $details = json_encode($payload);
        $stmt = $pdo->prepare('INSERT INTO applications (type, details, status, created_at, updated_at) VALUES (?, ?, "pending", NOW(), NOW())');
        $stmt->execute([$type, $details]);
        Response::success(['message' => 'Başvurunuz alındı.']);
    }
}
