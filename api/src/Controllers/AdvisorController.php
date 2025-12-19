<?php

namespace App\Controllers;

use PDO;
use App\Utils\Response;

class AdvisorController
{
    public static function list(PDO $pdo, string $baseUrl): void
    {
        $sql = 'SELECT u.id, u.name, u.email, u.phone, u.image, u.role, a.is_founder, a.about, a.specializations, a.sahibinden_link, a.experience_years, a.total_sales,
                (SELECT COUNT(*) FROM properties p WHERE p.advisor_id = u.id AND p.listing_status = "approved" AND p.listing_state = "active" AND p.deleted_at IS NULL) AS active_listings
                FROM users u LEFT JOIN advisors a ON a.user_id = u.id WHERE u.role = "advisor" AND u.deleted_at IS NULL ORDER BY u.name';
        $rows = $pdo->query($sql)->fetchAll();
        $data = array_map(function ($row) use ($baseUrl) {
            return self::formatAdvisor($row, $baseUrl);
        }, $rows);
        Response::success($data);
    }

    public static function detail(PDO $pdo, string $baseUrl, int $id): void
    {
        $stmt = $pdo->prepare('SELECT u.id, u.name, u.email, u.phone, u.image, u.role, a.is_founder, a.about, a.specializations, a.sahibinden_link, a.experience_years, a.total_sales FROM users u LEFT JOIN advisors a ON a.user_id = u.id WHERE u.id = ? AND u.role = "advisor"');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            Response::error(404, 'Danışman bulunamadı.');
        }
        $advisor = self::formatAdvisor($row, $baseUrl);
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM properties WHERE advisor_id = ? AND listing_status = "approved" AND listing_state = "active" AND deleted_at IS NULL');
        $stmt->execute([$id]);
        $advisor['stats'] = [
            'activeListings' => (int)$stmt->fetchColumn(),
            'totalSales' => (int)($row['total_sales'] ?? 0),
            'experience' => (int)($row['experience_years'] ?? 0),
        ];
        Response::success($advisor);
    }

    private static function formatAdvisor(array $row, string $baseUrl): array
    {
        return [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'role' => $row['role'],
            'phone' => $row['phone'],
            'image' => $row['image'] ? self::absoluteUrl($row['image'], $baseUrl) : null,
            'isFounder' => !empty($row['is_founder']),
            'about' => $row['about'] ?? null,
            'specializations' => json_decode($row['specializations'] ?? '[]', true) ?: [],
            'sahibindenLink' => $row['sahibinden_link'] ?? null,
            'stats' => [
                'totalSales' => (int)($row['total_sales'] ?? 0),
                'activeListings' => (int)($row['active_listings'] ?? 0),
                'experience' => (int)($row['experience_years'] ?? 0),
            ],
        ];
    }

    private static function absoluteUrl(?string $path, string $baseUrl): ?string
    {
        if (!$path) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    }
}
