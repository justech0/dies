<?php

namespace App\Middleware;

use App\Services\AuthService;
use App\Utils\Response;
use PDO;

class AuthMiddleware
{
    public static function getUser(PDO $pdo): ?array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!$authHeader || stripos($authHeader, 'Bearer ') !== 0) {
            return null;
        }
        $token = trim(substr($authHeader, 7));
        $payload = AuthService::decodeToken($token);
        if (!$payload) {
            return null;
        }
        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL');
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();
        if (!$user) {
            return null;
        }
        return $user;
    }

    public static function requireAuth(PDO $pdo, array $roles = []): array
    {
        $user = self::getUser($pdo);
        if (!$user) {
            Response::error(401, 'Oturum doğrulanamadı.');
        }
        if ($roles && !in_array($user['role'], $roles, true)) {
            Response::error(403, 'Bu işlem için yetkiniz yok.');
        }
        return $user;
    }
}
