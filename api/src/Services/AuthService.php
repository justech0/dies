<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use DateTimeImmutable;
use Exception;

class AuthService
{
    public static function generateToken(int $userId, string $role): string
    {
        $secret = getenv('JWT_SECRET');
        $now = new DateTimeImmutable();
        $exp = $now->modify('+7 days')->getTimestamp();
        $payload = [
            'sub' => $userId,
            'role' => $role,
            'iat' => $now->getTimestamp(),
            'exp' => $exp,
        ];
        return JWT::encode($payload, $secret, 'HS256');
    }

    public static function decodeToken(string $token): ?array
    {
        try {
            $secret = getenv('JWT_SECRET');
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            return [
                'user_id' => $decoded->sub,
                'role' => $decoded->role,
            ];
        } catch (Exception $e) {
            return null;
        }
    }
}
