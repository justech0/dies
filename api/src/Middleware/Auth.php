<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Http\Response;
use PDO;

class Auth
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function requireUser(array $request, array $options = []): array
    {
        $token = $this->getBearerToken();
        if (!$token) {
            Response::error('Yetkisiz erişim', 401);
        }

        $secret = $_ENV['JWT_SECRET'] ?? null;
        if (!$secret) {
            Response::error('JWT secret tanımlı değil', 500);
        }

        try {
            $payload = JWT::decode($token, new Key($secret, 'HS256'));
        } catch (\Exception $e) {
            Response::error('Geçersiz veya süresi dolmuş token', 401);
        }

        $stmt = $this->db->prepare('SELECT id, name, email, phone, role, image, instagram, facebook FROM users WHERE id = ?');
        $stmt->execute([$payload->uid]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Kullanıcı bulunamadı', 401);
        }

        $user['type'] = $user['role'];

        if (!empty($options['roles']) && !in_array($user['role'], $options['roles'], true)) {
            Response::error('Yetkisiz erişim', 403);
        }

        $request['user'] = $user;
        return $request;
    }

    private function getBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? null;
        if (!$header) {
            return null;
        }

        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    public function optionalUser(array $request): array
    {
        $token = $this->getBearerToken();
        if (!$token) {
            return $request;
        }

        $secret = $_ENV['JWT_SECRET'] ?? null;
        if (!$secret) {
            Response::error('JWT secret tanımlı değil', 500);
        }

        try {
            $payload = JWT::decode($token, new Key($secret, 'HS256'));
        } catch (\Exception $e) {
            Response::error('Geçersiz veya süresi dolmuş token', 401);
        }

        $stmt = $this->db->prepare('SELECT id, name, email, phone, role, image, instagram, facebook FROM users WHERE id = ?');
        $stmt->execute([$payload->uid]);
        $user = $stmt->fetch();

        if ($user) {
            $user['type'] = $user['role'];
            $request['user'] = $user;
        }

        return $request;
    }
}
