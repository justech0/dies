<?php

namespace App\Controllers;

use App\Http\Response;
use App\Utils\Validator;
use PDO;

class PropertyController extends BaseController
{
    public function list(array $request): void
    {
        $query = $request['query'] ?? [];
        $authUser = $request['user'] ?? null;
        $role = $authUser['role'] ?? null;

        $conditions = [];
        $params = [];

        if ($role === 'admin') {
            $conditions[] = '1=1';
        } elseif ($authUser) {
            $conditions[] = "(p.listing_status = 'approved' AND p.listing_state = 'active') OR p.advisor_id = :currentUser";
            $params[':currentUser'] = $authUser['id'];
        } else {
            $conditions[] = "p.listing_status = 'approved' AND p.listing_state = 'active'";
        }

        $this->applyFilters($query, $conditions, $params);

        $sql = "SELECT p.*, u.name AS advisor_name, u.phone AS advisor_phone, u.image AS advisor_image
                FROM properties p
                LEFT JOIN users u ON p.advisor_id = u.id
                WHERE " . implode(' AND ', array_map(fn($c) => "($c)", $conditions)) . "
                ORDER BY p.created_at DESC";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $properties = $stmt->fetchAll();

        $data = array_map(fn($row) => $this->formatProperty($row), $properties);
        Response::success($data);
    }

    public function detail(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $authUser = $request['user'] ?? null;
        $role = $authUser['role'] ?? null;

        if ($id <= 0) {
            Response::error('Geçersiz ilan', 404);
        }

        $conditions = [];
        $params = [':id' => $id];

        if ($role === 'admin') {
            $conditions[] = '1=1';
        } elseif ($authUser) {
            $conditions[] = "(p.listing_status = 'approved' AND p.listing_state = 'active') OR p.advisor_id = :currentUser";
            $params[':currentUser'] = $authUser['id'];
        } else {
            $conditions[] = "p.listing_status = 'approved' AND p.listing_state = 'active'";
        }

        $sql = "SELECT p.*, u.name AS advisor_name, u.phone AS advisor_phone, u.image AS advisor_image
                FROM properties p
                LEFT JOIN users u ON p.advisor_id = u.id
                WHERE p.id = :id AND (" . implode(') AND (', $conditions) . ")
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $property = $stmt->fetch();

        if (!$property) {
            Response::error('İlan bulunamadı', 404);
        }

        Response::success($this->formatProperty($property));
    }

    public function create(array $request): void
    {
        $authUser = $request['user'];
        $body = $request['body'] ?? [];

        $data = $this->normalizePayload($body);
        if ($authUser['role'] !== 'admin') {
            unset($data['listing_status']);
        }

        if (!$data['title'] || !$data['price'] || !$data['province'] || !$data['district'] || !$data['image']) {
            Response::error('Başlık, fiyat, kapak görseli ve konum bilgileri zorunludur', 422);
        }

        $listingStatus = ($authUser['role'] === 'admin' || $authUser['role'] === 'advisor') ? 'approved' : 'pending';
        $listingState = 'active';

        $stmt = $this->db->prepare('INSERT INTO properties (advisor_id, title, description, price, currency, province, district, neighborhood, category, listing_intent, listing_status, listing_state, image, images, bedrooms, bathrooms, area_gross, area_net, building_age, heating_type, is_furnished, floor_location, has_balcony, features, sahibinden_link, is_featured, created_at, updated_at) VALUES (:advisor_id, :title, :description, :price, :currency, :province, :district, :neighborhood, :category, :listing_intent, :listing_status, :listing_state, :image, :images, :bedrooms, :bathrooms, :area_gross, :area_net, :building_age, :heating_type, :is_furnished, :floor_location, :has_balcony, :features, :sahibinden_link, :is_featured, NOW(), NOW())');

        $stmt->execute([
            ':advisor_id' => $authUser['id'],
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':price' => $data['price'],
            ':currency' => $data['currency'] ?? 'TL',
            ':province' => $data['province'],
            ':district' => $data['district'],
            ':neighborhood' => $data['neighborhood'],
            ':category' => $data['category'] ?? 'Konut',
            ':listing_intent' => $data['listing_intent'] ?? 'sale',
            ':listing_status' => $listingStatus,
            ':listing_state' => $listingState,
            ':image' => $data['image'],
            ':images' => $data['images'] ? json_encode($data['images']) : null,
            ':bedrooms' => $data['bedrooms'],
            ':bathrooms' => $data['bathrooms'],
            ':area_gross' => $data['area_gross'],
            ':area_net' => $data['area_net'],
            ':building_age' => $data['building_age'],
            ':heating_type' => $data['heating_type'],
            ':is_furnished' => $data['is_furnished'] ? 1 : 0,
            ':floor_location' => $data['floor_location'],
            ':has_balcony' => $data['has_balcony'] ? 1 : 0,
            ':features' => $data['features'] ? json_encode($data['features']) : null,
            ':sahibinden_link' => $data['sahibinden_link'],
            ':is_featured' => $data['is_featured'] ? 1 : 0,
        ]);

        Response::success(['id' => (int)$this->db->lastInsertId()], 201);
    }

    public function update(array $request): void
    {
        $authUser = $request['user'];
        $id = (int)($request['params']['id'] ?? 0);
        $body = $request['body'] ?? [];

        $property = $this->findProperty($id);
        if (!$property) {
            Response::error('İlan bulunamadı', 404);
        }

        if ($authUser['role'] !== 'admin' && (int)$property['advisor_id'] !== (int)$authUser['id']) {
            Response::error('Bu ilan üzerinde yetkiniz yok', 403);
        }

        $data = $this->normalizePayload($body);
        $fields = [];
        $params = [':id' => $id];

        foreach ([
            'title', 'description', 'price', 'currency', 'province', 'district', 'neighborhood', 'category',
            'listing_intent', 'listing_status', 'listing_state', 'image', 'bedrooms', 'bathrooms', 'area_gross',
            'area_net', 'building_age', 'heating_type', 'is_furnished', 'floor_location', 'has_balcony',
            'sahibinden_link', 'is_featured'
        ] as $field) {
            if (array_key_exists($field, $data) && $data[$field] !== null) {
                $fields[] = "$field = :$field";
                $params[":$field"] = ($field === 'is_furnished' || $field === 'has_balcony' || $field === 'is_featured') ? (int)$data[$field] : $data[$field];
            }
        }

        if (isset($data['images'])) {
            $fields[] = 'images = :images';
            $params[':images'] = $data['images'] ? json_encode($data['images']) : null;
        }
        if (isset($data['features'])) {
            $fields[] = 'features = :features';
            $params[':features'] = $data['features'] ? json_encode($data['features']) : null;
        }

        if (empty($fields)) {
            Response::success(['message' => 'Güncellenecek alan bulunmuyor']);
        }

        $sql = 'UPDATE properties SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        Response::success(['message' => 'İlan güncellendi']);
    }

    public function delete(array $request): void
    {
        $authUser = $request['user'];
        $id = (int)($request['params']['id'] ?? 0);

        $property = $this->findProperty($id);
        if (!$property) {
            Response::error('İlan bulunamadı', 404);
        }

        if ($authUser['role'] !== 'admin' && (int)$property['advisor_id'] !== (int)$authUser['id']) {
            Response::error('Bu ilan üzerinde yetkiniz yok', 403);
        }

        $stmt = $this->db->prepare('DELETE FROM properties WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(['message' => 'İlan silindi']);
    }

    private function applyFilters(array $query, array &$conditions, array &$params): void
    {
        $mappingStatus = [
            'Satılık' => "p.listing_intent = 'sale'",
            'Kiralık' => "p.listing_intent = 'rent'",
            'Satıldı' => "p.listing_state = 'sold'",
            'Kiralandı' => "p.listing_state = 'rented'",
            'pending' => "p.listing_status = 'pending'",
        ];

        if (!empty($query['status']) && isset($mappingStatus[$query['status']])) {
            $conditions[] = $mappingStatus[$query['status']];
        }

        if (!empty($query['type'])) {
            $conditions[] = 'p.category = :category';
            $params[':category'] = $query['type'];
        }

        if (!empty($query['province'])) {
            $conditions[] = 'p.province = :province';
            $params[':province'] = $query['province'];
        }
        if (!empty($query['district'])) {
            $conditions[] = 'p.district = :district';
            $params[':district'] = $query['district'];
        }
        if (!empty($query['neighborhood'])) {
            $conditions[] = 'p.neighborhood = :neighborhood';
            $params[':neighborhood'] = $query['neighborhood'];
        }

        if (!empty($query['minPrice'])) {
            $conditions[] = 'p.price >= :minPrice';
            $params[':minPrice'] = (float)$query['minPrice'];
        }
        if (!empty($query['maxPrice'])) {
            $conditions[] = 'p.price <= :maxPrice';
            $params[':maxPrice'] = (float)$query['maxPrice'];
        }

        if (!empty($query['minArea'])) {
            $conditions[] = 'p.area_gross >= :minArea';
            $params[':minArea'] = (int)$query['minArea'];
        }
        if (!empty($query['maxArea'])) {
            $conditions[] = 'p.area_gross <= :maxArea';
            $params[':maxArea'] = (int)$query['maxArea'];
        }

        if (!empty($query['roomCount'])) {
            $conditions[] = 'p.bedrooms = :bedrooms';
            $params[':bedrooms'] = $query['roomCount'];
        }

        if (!empty($query['heatingType'])) {
            $conditions[] = 'p.heating_type = :heatingType';
            $params[':heatingType'] = $query['heatingType'];
        }

        if (!empty($query['buildingAge'])) {
            $conditions[] = 'p.building_age = :buildingAge';
            $params[':buildingAge'] = $query['buildingAge'];
        }

        if (!empty($query['floorLocation'])) {
            $conditions[] = 'p.floor_location = :floorLocation';
            $params[':floorLocation'] = $query['floorLocation'];
        }

        if (isset($query['isFurnished']) && $query['isFurnished'] !== '' && $query['isFurnished'] !== 'Tümü') {
            $conditions[] = 'p.is_furnished = :isFurnished';
            $params[':isFurnished'] = $query['isFurnished'] === 'Evet' ? 1 : 0;
        }

        if (isset($query['hasBalcony']) && $query['hasBalcony'] !== '' && $query['hasBalcony'] !== 'Tümü') {
            $conditions[] = 'p.has_balcony = :hasBalcony';
            $params[':hasBalcony'] = $query['hasBalcony'] === 'Evet' ? 1 : 0;
        }

        if (!empty($query['advisorId'])) {
            $conditions[] = 'p.advisor_id = :advisorId';
            $params[':advisorId'] = (int)$query['advisorId'];
        }

        if (isset($query['is_featured'])) {
            $conditions[] = 'p.is_featured = :isFeatured';
            $params[':isFeatured'] = (int)$query['is_featured'];
        }
    }

    private function normalizePayload(array $body): array
    {
        return [
            'title' => Validator::sanitizeString($body['title'] ?? null),
            'description' => Validator::sanitizeString($body['description'] ?? null),
            'price' => Validator::toFloat($body['price'] ?? null),
            'currency' => $body['currency'] ?? 'TL',
            'province' => Validator::sanitizeString($body['province'] ?? null),
            'district' => Validator::sanitizeString($body['district'] ?? null),
            'neighborhood' => Validator::sanitizeString($body['neighborhood'] ?? null),
            'category' => $body['category'] ?? $body['type'] ?? null,
            'listing_intent' => $body['listing_intent'] ?? $body['listingIntent'] ?? null,
            'listing_status' => $body['listing_status'] ?? null,
            'listing_state' => $body['listing_state'] ?? null,
            'image' => Validator::sanitizeString($body['image'] ?? null),
            'images' => isset($body['images']) && is_array($body['images']) ? $body['images'] : null,
            'bedrooms' => $body['bedrooms'] ?? $body['roomCount'] ?? null,
            'bathrooms' => Validator::toInt($body['bathrooms'] ?? null),
            'area_gross' => Validator::toInt($body['area_gross'] ?? $body['area'] ?? null),
            'area_net' => Validator::toInt($body['area_net'] ?? $body['netArea'] ?? null),
            'building_age' => $body['building_age'] ?? $body['buildingAge'] ?? null,
            'heating_type' => $body['heating_type'] ?? $body['heatingType'] ?? null,
            'is_furnished' => Validator::toBool($body['is_furnished'] ?? $body['isFurnished'] ?? false),
            'floor_location' => $body['floor_location'] ?? $body['floorLocation'] ?? null,
            'has_balcony' => Validator::toBool($body['has_balcony'] ?? $body['hasBalcony'] ?? false),
            'features' => isset($body['features']) && is_array($body['features']) ? $body['features'] : null,
            'sahibinden_link' => $body['sahibinden_link'] ?? $body['sahibindenLink'] ?? null,
            'is_featured' => Validator::toBool($body['is_featured'] ?? false),
        ];
    }

    private function findProperty(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM properties WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    private function formatProperty(array $row): array
    {
        $images = $row['images'] ? json_decode($row['images'], true) : [];
        $features = $row['features'] ? json_decode($row['features'], true) : [];

        return [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'price' => (float)$row['price'],
            'currency' => $row['currency'],
            'province' => $row['province'],
            'district' => $row['district'],
            'neighborhood' => $row['neighborhood'],
            'location' => trim(($row['province'] ?? '') . ' / ' . ($row['district'] ?? '')),
            'category' => $row['category'],
            'type' => $this->resolveType($row['listing_status'], $row['listing_state'], $row['listing_intent']),
            'image' => $row['image'],
            'images' => $images,
            'bedrooms' => $row['bedrooms'],
            'bathrooms' => isset($row['bathrooms']) ? (int)$row['bathrooms'] : null,
            'area' => isset($row['area_gross']) ? (int)$row['area_gross'] : null,
            'netArea' => isset($row['area_net']) ? (int)$row['area_net'] : null,
            'advisorId' => isset($row['advisor_id']) ? (int)$row['advisor_id'] : null,
            'sahibindenLink' => $row['sahibinden_link'] ?? null,
            'description' => $row['description'],
            'features' => $features ?: [],
            'date' => $row['created_at'] ?? null,
            'buildingAge' => $row['building_age'] ?? null,
            'heatingType' => $row['heating_type'] ?? null,
            'floorLocation' => $row['floor_location'] ?? null,
            'hasBalcony' => (bool)($row['has_balcony'] ?? false),
            'isFurnished' => (bool)($row['is_furnished'] ?? false),
            'is_featured' => (bool)($row['is_featured'] ?? false),
            'advisorName' => $row['advisor_name'] ?? null,
            'advisorPhone' => $row['advisor_phone'] ?? null,
            'advisorImage' => $row['advisor_image'] ?? null,
            'listing_status' => $row['listing_status'] ?? null,
            'listing_state' => $row['listing_state'] ?? null,
        ];
    }

    private function resolveType(?string $status, ?string $state, ?string $intent): string
    {
        if ($status === 'pending') {
            return 'pending';
        }

        if ($state === 'sold') {
            return 'Satıldı';
        }

        if ($state === 'rented') {
            return 'Kiralandı';
        }

        return $intent === 'rent' ? 'Kiralık' : 'Satılık';
    }
}
