<?php

namespace App\Controllers;

use App\Http\Response;
use App\Services\MailService;
use App\Utils\Validator;
use Firebase\JWT\JWT;
use PDO;

class AuthController extends BaseController
{
    public function login(array $request): void
    {
        $body = $request['body'] ?? [];
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            Response::error('Email ve şifre zorunludur', 422);
        }

        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::error('Email veya şifre hatalı', 401);
        }

        $formatted = $this->formatUser($user, true);
        $token = $this->generateToken($user['id'], $user['role']);

        Response::success(['user' => $formatted, 'token' => $token]);
    }

    public function register(array $request): void
    {
        $body = $request['body'] ?? [];
        $name = Validator::sanitizeString($body['name'] ?? '');
        $email = strtolower(trim($body['email'] ?? ''));
        $phone = Validator::sanitizeString($body['phone'] ?? '');
        $password = $body['password'] ?? '';

        if (!$name || !$email || !$password) {
            Response::error('Ad, email ve şifre zorunludur', 422);
        }

        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('Bu email ile kayıtlı kullanıcı zaten mevcut', 409);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $now = date('Y-m-d H:i:s');
        $stmt = $this->db->prepare('INSERT INTO users (name, email, phone, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, "user", ?, ?)');
        $stmt->execute([$name, $email, $phone, $hash, $now, $now]);

        $userId = (int)$this->db->lastInsertId();
        $user = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'role' => 'user',
            'image' => null,
            'instagram' => null,
            'facebook' => null,
        ];

        $formatted = $this->formatUser($user);
        $token = $this->generateToken($userId, 'user');

        Response::success(['user' => $formatted, 'token' => $token], 201);
    }

    public function me(array $request): void
    {
        $user = $request['user'];
        $formatted = $this->fetchUserWithAdvisor((int)$user['id']);
        Response::success(['user' => $formatted]);
    }

    public function updateProfile(array $request): void
    {
        $user = $request['user'];
        $body = $request['body'] ?? [];

        $name = Validator::sanitizeString($body['name'] ?? null);
        $phone = Validator::sanitizeString($body['phone'] ?? null);
        $instagram = Validator::sanitizeString($body['instagram'] ?? null);
        $facebook = Validator::sanitizeString($body['facebook'] ?? null);
        $image = Validator::sanitizeString($body['image'] ?? null);

        $stmt = $this->db->prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), instagram = COALESCE(?, instagram), facebook = COALESCE(?, facebook), image = COALESCE(?, image), updated_at = NOW() WHERE id = ?');
        $stmt->execute([$name, $phone, $instagram, $facebook, $image, $user['id']]);

        if ($user['role'] === 'advisor') {
            $about = Validator::sanitizeString($body['about'] ?? null);
            $specializations = isset($body['specializations']) && is_array($body['specializations']) ? $body['specializations'] : null;

            $existing = $this->db->prepare('SELECT user_id FROM advisors WHERE user_id = ?');
            $existing->execute([$user['id']]);

            if ($existing->fetch()) {
                $update = $this->db->prepare('UPDATE advisors SET about = COALESCE(?, about), specializations = COALESCE(?, specializations) WHERE user_id = ?');
                $update->execute([$about, $specializations ? json_encode($specializations) : null, $user['id']]);
            } else {
                $insert = $this->db->prepare('INSERT INTO advisors (user_id, is_founder, about, specializations, experience_years, total_sales) VALUES (?, 0, ?, ?, 0, 0)');
                $insert->execute([$user['id'], $about, $specializations ? json_encode($specializations) : null]);
            }
        }

        $formatted = $this->fetchUserWithAdvisor((int)$user['id']);
        Response::success(['user' => $formatted]);
    }

    public function forgotPassword(array $request): void
    {
        $body = $request['body'] ?? [];
        $email = strtolower(trim($body['email'] ?? ''));

        $message = 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama adımları gönderildi.';
        if (!$email) {
            Response::success(['message' => $message]);
        }

        $stmt = $this->db->prepare('SELECT id, name FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            $token = bin2hex(random_bytes(32));
            $hash = hash('sha256', $token);
            $expires = date('Y-m-d H:i:s', time() + 3600);

            $insert = $this->db->prepare('INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, NOW())');
            $insert->execute([$user['id'], $hash, $expires]);

            $resetLink = ($_ENV['APP_URL'] ?? '') . '/reset-password?token=' . $token;
            $bodyMessage = "Merhaba {$user['name']},\n\nŞifrenizi sıfırlamak için bu kodu kullanın: {$token}\n\nBağlantı: {$resetLink}";
            (new MailService())->send($email, 'Dies Şifre Sıfırlama', nl2br($bodyMessage));
        }

        Response::success(['message' => $message]);
    }

    public function resetPassword(array $request): void
    {
        $body = $request['body'] ?? [];
        $token = $body['token'] ?? '';
        $newPassword = $body['new_password'] ?? '';

        if (!$token || !$newPassword) {
            Response::error('Token ve yeni şifre zorunludur', 422);
        }

        $hash = hash('sha256', $token);
        $stmt = $this->db->prepare('SELECT * FROM password_resets WHERE token_hash = ? AND (used_at IS NULL) AND expires_at >= NOW() ORDER BY created_at DESC LIMIT 1');
        $stmt->execute([$hash]);
        $reset = $stmt->fetch();

        if (!$reset) {
            Response::error('Geçersiz veya kullanılmış token', 400);
        }

        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->db->beginTransaction();
        try {
            $updateUser = $this->db->prepare('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?');
            $updateUser->execute([$passwordHash, $reset['user_id']]);

            $markUsed = $this->db->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?');
            $markUsed->execute([$reset['id']]);

            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            Response::error('Şifre güncellenemedi', 500);
        }

        Response::success(['message' => 'Şifre başarıyla güncellendi']);
    }

    private function generateToken(int $userId, string $role): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? '';
        $payload = [
            'uid' => $userId,
            'role' => $role,
            'exp' => time() + (60 * 60 * 24 * 7),
        ];
        return JWT::encode($payload, $secret, 'HS256');
    }

    private function fetchUserWithAdvisor(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT u.id, u.name, u.email, u.phone, u.role, u.image, u.instagram, u.facebook, a.is_founder, a.about, a.specializations, a.sahibinden_link, a.experience_years, a.total_sales FROM users u LEFT JOIN advisors a ON u.id = a.user_id WHERE u.id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Kullanıcı bulunamadı', 404);
        }

        $formatted = $this->formatUser($user, true);

        if ($user['role'] === 'advisor') {
            $formatted['specializations'] = $user['specializations'] ? (json_decode($user['specializations'], true) ?: []) : [];
            $formatted['about'] = $user['about'] ?? null;
            $formatted['isFounder'] = (bool)($user['is_founder'] ?? false);
            $formatted['sahibindenLink'] = $user['sahibinden_link'] ?? null;
            $formatted['stats'] = [
                'experience' => (int)($user['experience_years'] ?? 0),
                'totalSales' => (int)($user['total_sales'] ?? 0),
                'activeListings' => $this->getActiveListingCount($userId),
            ];
        }

        return $formatted;
    }

    private function getActiveListingCount(int $advisorId): int
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM properties WHERE advisor_id = ? AND listing_status = 'approved' AND listing_state = 'active'");
        $stmt->execute([$advisorId]);
        $row = $stmt->fetch();
        return (int)($row['total'] ?? 0);
    }

    private function formatUser(array $user, bool $includeExtras = false): array
    {
        $payload = [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'] ?? null,
            'role' => $user['role'],
            'type' => $user['role'],
            'image' => $user['image'] ?? null,
            'instagram' => $user['instagram'] ?? null,
            'facebook' => $user['facebook'] ?? null,
        ];

        if ($includeExtras && isset($user['about'])) {
            $payload['about'] = $user['about'];
        }

        return $payload;
    }
}
