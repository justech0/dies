<?php

namespace App\Controllers;

use PDO;
use App\Utils\Response;
use App\Services\AuthService;
use App\Middleware\AuthMiddleware;

class AuthController
{
    public static function register(PDO $pdo, array $payload): void
    {
        $name = trim($payload['name'] ?? '');
        $email = strtolower(trim($payload['email'] ?? ''));
        $password = $payload['password'] ?? '';
        $phone = $payload['phone'] ?? null;

        if (!$name || !$email || !$password) {
            Response::error(422, 'Lütfen gerekli alanları doldurun.');
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error(400, 'Bu email ile kayıtlı kullanıcı zaten var.');
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, "user", NOW(), NOW())');
        $stmt->execute([$name, $email, $hash, $phone]);
        $userId = (int)$pdo->lastInsertId();

        $user = self::getUserById($pdo, $userId);
        $token = AuthService::generateToken($userId, $user['role']);
        Response::success(['user' => $user, 'token' => $token], 201);
    }

    public static function login(PDO $pdo, array $payload): void
    {
        $email = strtolower(trim($payload['email'] ?? ''));
        $password = $payload['password'] ?? '';
        if (!$email || !$password) {
            Response::error(422, 'Email ve şifre gerekli.');
        }

        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::error(401, 'Geçersiz email veya şifre.');
        }

        $token = AuthService::generateToken((int)$user['id'], $user['role']);
        unset($user['password_hash']);
        Response::success(['user' => $user, 'token' => $token]);
    }

    public static function me(PDO $pdo, array $user): void
    {
        Response::success($user);
    }

    public static function updateProfile(PDO $pdo, array $user, array $payload): void
    {
        $fields = ['name', 'phone', 'image', 'instagram', 'facebook'];
        $updates = [];
        $params = [];
        foreach ($fields as $field) {
            if (array_key_exists($field, $payload)) {
                $updates[] = "$field = ?";
                $params[] = $payload[$field];
            }
        }
        if ($updates) {
            $params[] = $user['id'];
            $sql = 'UPDATE users SET ' . implode(',', $updates) . ', updated_at = NOW() WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }

        if ($user['role'] === 'advisor') {
            $about = $payload['about'] ?? null;
            $specializations = isset($payload['specializations']) ? json_encode($payload['specializations']) : null;
            $sahibinden = $payload['sahibinden_link'] ?? null;
            $experience = $payload['experience_years'] ?? 0;
            $totalSales = $payload['total_sales'] ?? 0;
            $stmt = $pdo->prepare('SELECT user_id FROM advisors WHERE user_id = ?');
            $stmt->execute([$user['id']]);
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare('UPDATE advisors SET about = ?, specializations = ?, sahibinden_link = ?, experience_years = ?, total_sales = ? WHERE user_id = ?');
                $stmt->execute([$about, $specializations, $sahibinden, $experience, $totalSales, $user['id']]);
            } else {
                $stmt = $pdo->prepare('INSERT INTO advisors (user_id, about, specializations, sahibinden_link, experience_years, total_sales) VALUES (?, ?, ?, ?, ?, ?)');
                $stmt->execute([$user['id'], $about, $specializations, $sahibinden, $experience, $totalSales]);
            }
        }

        $fresh = self::getUserById($pdo, (int)$user['id']);
        Response::success(['user' => $fresh]);
    }

    public static function forgotPassword(PDO $pdo, array $payload): void
    {
        $email = strtolower(trim($payload['email'] ?? ''));
        if (!$email) {
            Response::error(422, 'Email gerekli.');
        }
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user) {
            $token = bin2hex(random_bytes(16));
            $hash = hash('sha256', $token);
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
            $stmt = $pdo->prepare('INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, NOW())');
            $stmt->execute([$user['id'], $hash, $expires]);
            // Mailing optional
            if (getenv('MAIL_ENABLED') == '1') {
                // Silently ignore errors; mailing handled elsewhere
            }
            $env = getenv('APP_ENV') ?: 'production';
            $data = ['message' => 'Eğer email kayıtlıysa şifre sıfırlama talimatı gönderildi.'];
            if ($env === 'local' || $env === 'development') {
                $data['debugToken'] = $token;
            }
            Response::success($data);
        }
        Response::success(['message' => 'Eğer email kayıtlıysa şifre sıfırlama talimatı gönderildi.']);
    }

    public static function resetPassword(PDO $pdo, array $payload): void
    {
        $token = $payload['token'] ?? '';
        $newPassword = $payload['newPassword'] ?? '';
        if (!$token || !$newPassword) {
            Response::error(422, 'Token ve yeni şifre gereklidir.');
        }
        $hash = hash('sha256', $token);
        $stmt = $pdo->prepare('SELECT * FROM password_resets WHERE token_hash = ? AND (used_at IS NULL) AND expires_at >= NOW() ORDER BY id DESC LIMIT 1');
        $stmt->execute([$hash]);
        $reset = $stmt->fetch();
        if (!$reset) {
            Response::error(400, 'Geçersiz veya süresi dolmuş token.');
        }
        $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$passwordHash, $reset['user_id']]);
        $stmt = $pdo->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?');
        $stmt->execute([$reset['id']]);
        $pdo->commit();
        Response::success(['message' => 'Şifre güncellendi.']);
    }

    public static function getUserById(PDO $pdo, int $id): array
    {
        $stmt = $pdo->prepare('SELECT id, name, email, phone, role, image, instagram, facebook, created_at, updated_at FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) {
            Response::error(404, 'Kullanıcı bulunamadı.');
        }
        return $user;
    }
}
