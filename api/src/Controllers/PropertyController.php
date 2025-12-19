<?php

namespace App\Controllers;

use PDO;
use App\Utils\Response;
use App\Middleware\AuthMiddleware;

class PropertyController
{
    public static function list(PDO $pdo, ?array $user, array $query, string $baseUrl): void
    {
        $sql = 'SELECT p.*, u.name AS advisor_name, u.image AS advisor_image, u.phone AS advisor_phone FROM properties p LEFT JOIN users u ON p.advisor_id = u.id WHERE p.deleted_at IS NULL';
        $params = [];

        $isAdmin = $user && $user['role'] === 'admin';
        $advisorIdFilter = $query['advisorId'] ?? null;

        if (!$isAdmin) {
            if ($advisorIdFilter && $user && (int)$advisorIdFilter === (int)$user['id']) {
                // allow advisor to see own including pending
            } else {
                $sql .= ' AND p.listing_status = "approved" AND p.listing_state = "active"';
            }
        }

        if (!empty($query['status'])) {
            $status = $query['status'];
            if ($status === 'Satılık') {
                $sql .= ' AND p.listing_intent = "sale" AND p.listing_state = "active"';
            } elseif ($status === 'Kiralık') {
                $sql .= ' AND p.listing_intent = "rent" AND p.listing_state = "active"';
            } elseif ($status === 'Satıldı') {
                $sql .= ' AND p.listing_state = "sold"';
            } elseif ($status === 'Kiralandı') {
                $sql .= ' AND p.listing_state = "rented"';
            } elseif ($status === 'pending') {
                $sql .= ' AND p.listing_status = "pending"';
            }
        }

        if (!empty($query['type'])) {
            $sql .= ' AND p.category = ?';
            $params[] = $query['type'];
        }

        foreach ([
            'province' => 'p.province',
            'district' => 'p.district',
            'neighborhood' => 'p.neighborhood'
        ] as $key => $column) {
            if (!empty($query[$key])) {
                $sql .= " AND {$column} = ?";
                $params[] = $query[$key];
            }
        }

        if (!empty($query['minPrice'])) {
            $sql .= ' AND p.price >= ?';
            $params[] = (float)$query['minPrice'];
        }
        if (!empty($query['maxPrice'])) {
            $sql .= ' AND p.price <= ?';
            $params[] = (float)$query['maxPrice'];
        }
        if (!empty($query['minArea'])) {
            $sql .= ' AND p.area_gross >= ?';
            $params[] = (int)$query['minArea'];
        }
        if (!empty($query['maxArea'])) {
            $sql .= ' AND p.area_gross <= ?';
            $params[] = (int)$query['maxArea'];
        }
        if (!empty($query['roomCount'])) {
            $sql .= ' AND p.bedrooms = ?';
            $params[] = $query['roomCount'];
        }
        if (!empty($query['heatingType'])) {
            $sql .= ' AND p.heating_type = ?';
            $params[] = $query['heatingType'];
        }
        if (!empty($query['buildingAge'])) {
            $sql .= ' AND p.building_age = ?';
            $params[] = $query['buildingAge'];
        }
        if (!empty($query['isFurnished']) && $query['isFurnished'] !== 'Tümü') {
            $sql .= ' AND p.is_furnished = ?';
            $params[] = ($query['isFurnished'] === 'Evet') ? 1 : 0;
        }
        if (!empty($query['hasBalcony']) && $query['hasBalcony'] !== 'Tümü') {
            $sql .= ' AND p.has_balcony = ?';
            $params[] = ($query['hasBalcony'] === 'Evet') ? 1 : 0;
        }
        if (!empty($query['is_featured'])) {
            $sql .= ' AND p.is_featured = 1';
        }
        if (!empty($advisorIdFilter)) {
            $sql .= ' AND (p.advisor_id = ? OR p.created_by = ?)';
            $params[] = (int)$advisorIdFilter;
            $params[] = (int)$advisorIdFilter;
        }

        $sql .= ' ORDER BY p.created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $data = array_map(fn($row) => self::formatProperty($row, $baseUrl), $rows);
        Response::success($data);
    }

    public static function detail(PDO $pdo, ?array $user, int $id, string $baseUrl): void
    {
        $stmt = $pdo->prepare('SELECT p.*, u.name AS advisor_name, u.image AS advisor_image, u.phone AS advisor_phone FROM properties p LEFT JOIN users u ON p.advisor_id = u.id WHERE p.id = ? AND p.deleted_at IS NULL');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            Response::error(404, 'İlan bulunamadı.');
        }
        if (!$user || $user['role'] !== 'admin') {
            if ($row['listing_status'] !== 'approved' || $row['listing_state'] !== 'active') {
                if (!$user || ((int)$row['created_by'] !== (int)$user['id'] && (int)$row['advisor_id'] !== (int)$user['id'])) {
                    Response::error(403, 'Bu ilanı görüntüleme yetkiniz yok.');
                }
            }
        }
        Response::success(self::formatProperty($row, $baseUrl));
    }

    public static function create(PDO $pdo, array $user, array $payload, string $baseUrl): void
    {
        $title = trim($payload['title'] ?? '');
        $description = trim($payload['description'] ?? '');
        $price = $payload['price'] ?? null;
        $category = $payload['category'] ?? null;
        $listingIntent = $payload['listing_intent'] ?? ($payload['intent'] ?? null);
        $province = $payload['province'] ?? null;
        $district = $payload['district'] ?? null;
        $neighborhood = $payload['neighborhood'] ?? null;
        $image = $payload['image'] ?? null;
        if (!$title || !$description || !$price || !$category || !$listingIntent || !$province || !$district || !$neighborhood || !$image) {
            Response::error(422, 'Zorunlu alanlar eksik.');
        }

        $status = ($user['role'] === 'advisor' || $user['role'] === 'admin') ? 'approved' : 'pending';
        $advisorId = ($user['role'] === 'advisor') ? $user['id'] : ($payload['advisor_id'] ?? null);
        $images = isset($payload['images']) ? json_encode($payload['images']) : json_encode([]);
        $features = isset($payload['features']) ? json_encode($payload['features']) : json_encode([]);

        $stmt = $pdo->prepare('INSERT INTO properties (created_by, advisor_id, title, description, price, currency, province, district, neighborhood, category, listing_intent, listing_status, listing_state, image, images, bedrooms, bathrooms, area_gross, area_net, floor_location, heating_type, building_age, balcony_count, is_furnished, is_in_complex, has_balcony, features, sahibinden_link, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "TL", ?, ?, ?, ?, ?, ?, "active", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([
            $user['id'],
            $advisorId,
            $title,
            $description,
            $price,
            $province,
            $district,
            $neighborhood,
            $category,
            $listingIntent,
            $status,
            $image,
            $images,
            $payload['bedrooms'] ?? null,
            $payload['bathrooms'] ?? null,
            $payload['area_gross'] ?? null,
            $payload['area_net'] ?? null,
            $payload['floor_location'] ?? null,
            $payload['heating_type'] ?? null,
            $payload['building_age'] ?? null,
            $payload['balcony_count'] ?? 0,
            !empty($payload['is_furnished']) ? 1 : 0,
            !empty($payload['is_in_complex']) ? 1 : 0,
            !empty($payload['has_balcony']) ? 1 : 0,
            $features,
            $payload['sahibinden_link'] ?? null,
            !empty($payload['is_featured']) ? 1 : 0,
        ]);
        $id = (int)$pdo->lastInsertId();
        self::detail($pdo, $user, $id, $baseUrl);
    }

    public static function update(PDO $pdo, array $user, int $id, array $payload, string $baseUrl): void
    {
        $existing = self::getProperty($pdo, $id);
        self::authorize($existing, $user);

        $fields = ['title','description','price','currency','province','district','neighborhood','category','listing_intent','listing_status','listing_state','image','bedrooms','bathrooms','area_gross','area_net','floor_location','heating_type','building_age','balcony_count','is_furnished','is_in_complex','has_balcony','sahibinden_link','is_featured','advisor_id'];
        $updates = [];
        $params = [];
        foreach ($fields as $field) {
            if (array_key_exists($field, $payload)) {
                $updates[] = "$field = ?";
                $params[] = ($field === 'is_furnished' || $field === 'is_in_complex' || $field === 'has_balcony' || $field === 'is_featured') ? (int)!empty($payload[$field]) : $payload[$field];
            }
        }
        if (isset($payload['images'])) {
            $updates[] = 'images = ?';
            $params[] = json_encode($payload['images']);
        }
        if (isset($payload['features'])) {
            $updates[] = 'features = ?';
            $params[] = json_encode($payload['features']);
        }
        if (!$updates) {
            Response::success(['message' => 'Güncellenecek veri yok.']);
        }
        $params[] = $id;
        $sql = 'UPDATE properties SET ' . implode(',', $updates) . ', updated_at = NOW() WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        self::detail($pdo, $user, $id, $baseUrl);
    }

    public static function delete(PDO $pdo, array $user, int $id): void
    {
        $existing = self::getProperty($pdo, $id);
        self::authorize($existing, $user);
        $stmt = $pdo->prepare('UPDATE properties SET deleted_at = NOW() WHERE id = ?');
        $stmt->execute([$id]);
        Response::success(['message' => 'Silindi.']);
    }

    private static function authorize(array $property, array $user): void
    {
        if ($user['role'] === 'admin') {
            return;
        }
        if ($user['role'] === 'advisor') {
            if ((int)$property['advisor_id'] === (int)$user['id'] || (int)$property['created_by'] === (int)$user['id']) {
                return;
            }
        }
        if ((int)$property['created_by'] === (int)$user['id']) {
            return;
        }
        Response::error(403, 'Bu işlem için yetkiniz yok.');
    }

    private static function getProperty(PDO $pdo, int $id): array
    {
        $stmt = $pdo->prepare('SELECT * FROM properties WHERE id = ? AND deleted_at IS NULL');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            Response::error(404, 'İlan bulunamadı.');
        }
        return $row;
    }

    private static function formatProperty(array $row, string $baseUrl): array
    {
        $type = 'pending';
        if ($row['listing_status'] === 'approved') {
            if ($row['listing_intent'] === 'sale') {
                $type = $row['listing_state'] === 'sold' ? 'Satıldı' : 'Satılık';
            } elseif ($row['listing_intent'] === 'rent') {
                $type = $row['listing_state'] === 'rented' ? 'Kiralandı' : 'Kiralık';
            }
        }
        $images = [];
        if (!empty($row['images'])) {
            $decoded = json_decode($row['images'], true);
            if (is_array($decoded)) {
                $images = array_map(fn($img) => self::absoluteUrl($img, $baseUrl), $decoded);
            }
        }
        $cover = self::absoluteUrl($row['image'] ?? '', $baseUrl);
        return [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'price' => (float)$row['price'],
            'currency' => $row['currency'] ?? 'TL',
            'location' => trim(($row['province'] ?? '') . ' ' . ($row['district'] ?? '') . ' ' . ($row['neighborhood'] ?? '')),
            'province' => $row['province'] ?? null,
            'district' => $row['district'] ?? null,
            'neighborhood' => $row['neighborhood'] ?? null,
            'type' => $type,
            'category' => $row['category'],
            'image' => $cover,
            'images' => $images,
            'bedrooms' => $row['bedrooms'],
            'bathrooms' => isset($row['bathrooms']) ? (int)$row['bathrooms'] : null,
            'area' => isset($row['area_gross']) ? (int)$row['area_gross'] : 0,
            'netArea' => isset($row['area_net']) ? (int)$row['area_net'] : null,
            'advisorId' => isset($row['advisor_id']) ? (int)$row['advisor_id'] : null,
            'features' => json_decode($row['features'] ?? '[]', true) ?: [],
            'date' => $row['created_at'] ?? null,
            'buildingAge' => $row['building_age'] ?? null,
            'heatingType' => $row['heating_type'] ?? null,
            'floorLocation' => $row['floor_location'] ?? null,
            'totalFloors' => $row['total_floors'] ?? null,
            'isFurnished' => !empty($row['is_furnished']),
            'isInComplex' => !empty($row['is_in_complex']),
            'balconyCount' => $row['balcony_count'] ?? null,
            'hasBalcony' => !empty($row['has_balcony']),
            'advisorName' => $row['advisor_name'] ?? null,
            'advisorImage' => isset($row['advisor_image']) ? self::absoluteUrl($row['advisor_image'], $baseUrl) : null,
            'advisorPhone' => $row['advisor_phone'] ?? null,
            'isFeatured' => !empty($row['is_featured']),
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
