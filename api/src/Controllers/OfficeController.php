<?php

namespace App\Controllers;

use PDO;
use App\Utils\Response;

class OfficeController
{
    public static function list(PDO $pdo, string $baseUrl): void
    {
        $rows = $pdo->query('SELECT * FROM offices WHERE deleted_at IS NULL ORDER BY is_headquarters DESC, name')->fetchAll();
        $data = array_map(function ($row) use ($baseUrl) {
            return self::formatOffice($row, $baseUrl);
        }, $rows);
        Response::success($data);
    }

    public static function create(PDO $pdo, array $payload): void
    {
        $required = ['name','address','phone','image','working_hours','city','district'];
        foreach ($required as $field) {
            if (empty($payload[$field])) {
                Response::error(422, 'Ofis için gerekli alanlar eksik.');
            }
        }
        $gallery = isset($payload['gallery']) ? json_encode($payload['gallery']) : json_encode([]);
        $stmt = $pdo->prepare('INSERT INTO offices (name,address,phone,phone2,whatsapp,image,gallery,location_url,working_hours,is_headquarters,city,district,description,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?, ?, ?, NOW(), NOW())');
        $stmt->execute([
            $payload['name'],
            $payload['address'],
            $payload['phone'],
            $payload['phone2'] ?? null,
            $payload['whatsapp'] ?? null,
            $payload['image'],
            $gallery,
            $payload['locationUrl'] ?? null,
            $payload['working_hours'] ?? $payload['workingHours'] ?? '',
            !empty($payload['isHeadquarters']) ? 1 : 0,
            $payload['city'],
            $payload['district'],
            $payload['description'] ?? null,
        ]);
        Response::success(['id' => (int)$pdo->lastInsertId()], 201);
    }

    public static function update(PDO $pdo, int $id, array $payload): void
    {
        $fields = ['name','address','phone','phone2','whatsapp','image','location_url','working_hours','is_headquarters','city','district','description'];
        $updates = [];
        $params = [];
        foreach ($fields as $field) {
            $key = $field;
            $payloadKey = $field;
            if ($field === 'location_url' && isset($payload['locationUrl'])) {
                $payloadKey = 'locationUrl';
            }
            if ($field === 'working_hours' && isset($payload['workingHours'])) {
                $payloadKey = 'workingHours';
            }
            if (array_key_exists($payloadKey, $payload)) {
                $updates[] = "$field = ?";
                $value = $payload[$payloadKey];
                if ($field === 'is_headquarters') {
                    $value = !empty($value) ? 1 : 0;
                }
                $params[] = $value;
            }
        }
        if (isset($payload['gallery'])) {
            $updates[] = 'gallery = ?';
            $params[] = json_encode($payload['gallery']);
        }
        if (!$updates) {
            Response::success(['message' => 'Güncellenecek veri yok.']);
        }
        $params[] = $id;
        $sql = 'UPDATE offices SET ' . implode(',', $updates) . ', updated_at = NOW() WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        Response::success(['message' => 'Güncellendi.']);
    }

    public static function delete(PDO $pdo, int $id): void
    {
        $stmt = $pdo->prepare('UPDATE offices SET deleted_at = NOW() WHERE id = ?');
        $stmt->execute([$id]);
        Response::success(['message' => 'Silindi.']);
    }

    private static function formatOffice(array $row, string $baseUrl): array
    {
        return [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'address' => $row['address'],
            'phone' => $row['phone'],
            'phone2' => $row['phone2'] ?? null,
            'whatsapp' => $row['whatsapp'] ?? null,
            'image' => $row['image'] ? self::absoluteUrl($row['image'], $baseUrl) : null,
            'gallery' => json_decode($row['gallery'] ?? '[]', true) ?: [],
            'locationUrl' => $row['location_url'] ?? null,
            'workingHours' => $row['working_hours'] ?? null,
            'isHeadquarters' => !empty($row['is_headquarters']),
            'city' => $row['city'] ?? null,
            'district' => $row['district'] ?? null,
            'description' => $row['description'] ?? null,
        ];
    }

    private static function absoluteUrl(?string $path, string $baseUrl): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;
        return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    }
}
