<?php

namespace App\Controllers;

use App\Http\Response;
use App\Utils\Validator;
use PDO;

class OfficeController extends BaseController
{
    public function list(array $request = []): void
    {
        $stmt = $this->db->query('SELECT * FROM offices ORDER BY is_headquarters DESC, created_at DESC');
        $offices = [];
        while ($row = $stmt->fetch()) {
            $offices[] = $this->formatOffice($row);
        }
        Response::success($offices);
    }

    public function create(array $request): void
    {
        $body = $request['body'] ?? [];
        $data = $this->normalize($body);

        $stmt = $this->db->prepare('INSERT INTO offices (name, city, district, address, phone, phone2, whatsapp, working_hours, location_url, is_headquarters, image, gallery, description, created_at) VALUES (:name, :city, :district, :address, :phone, :phone2, :whatsapp, :working_hours, :location_url, :is_headquarters, :image, :gallery, :description, NOW())');
        $stmt->execute([
            ':name' => $data['name'],
            ':city' => $data['city'],
            ':district' => $data['district'],
            ':address' => $data['address'],
            ':phone' => $data['phone'],
            ':phone2' => $data['phone2'],
            ':whatsapp' => $data['whatsapp'],
            ':working_hours' => $data['working_hours'],
            ':location_url' => $data['location_url'],
            ':is_headquarters' => $data['is_headquarters'] ? 1 : 0,
            ':image' => $data['image'],
            ':gallery' => $data['gallery'] ? json_encode($data['gallery']) : null,
            ':description' => $data['description'],
        ]);

        Response::success(['id' => (int)$this->db->lastInsertId()], 201);
    }

    public function update(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $body = $request['body'] ?? [];
        $data = $this->normalize($body);

        $fields = [];
        $params = [':id' => $id];
        foreach ([
            'name', 'city', 'district', 'address', 'phone', 'phone2', 'whatsapp', 'working_hours', 'location_url', 'is_headquarters', 'image', 'description'
        ] as $field) {
            if ($data[$field] !== null) {
                $fields[] = "$field = :$field";
                $params[":$field"] = ($field === 'is_headquarters') ? (int)$data[$field] : $data[$field];
            }
        }

        if ($data['gallery'] !== null) {
            $fields[] = 'gallery = :gallery';
            $params[':gallery'] = json_encode($data['gallery']);
        }

        if (empty($fields)) {
            Response::success(['message' => 'Güncellenecek alan yok']);
        }

        $sql = 'UPDATE offices SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        Response::success(['message' => 'Ofis güncellendi']);
    }

    public function delete(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $stmt = $this->db->prepare('DELETE FROM offices WHERE id = ?');
        $stmt->execute([$id]);
        Response::success(['message' => 'Ofis silindi']);
    }

    private function normalize(array $body): array
    {
        return [
            'name' => Validator::sanitizeString($body['name'] ?? null),
            'city' => Validator::sanitizeString($body['city'] ?? null),
            'district' => Validator::sanitizeString($body['district'] ?? null),
            'address' => Validator::sanitizeString($body['address'] ?? null),
            'phone' => Validator::sanitizeString($body['phone'] ?? null),
            'phone2' => Validator::sanitizeString($body['phone2'] ?? null),
            'whatsapp' => Validator::sanitizeString($body['whatsapp'] ?? null),
            'working_hours' => Validator::sanitizeString($body['workingHours'] ?? $body['working_hours'] ?? null),
            'location_url' => Validator::sanitizeString($body['locationUrl'] ?? $body['location_url'] ?? null),
            'is_headquarters' => isset($body['isHeadquarters']) ? Validator::toBool($body['isHeadquarters']) : (isset($body['is_headquarters']) ? Validator::toBool($body['is_headquarters']) : null),
            'image' => Validator::sanitizeString($body['image'] ?? null),
            'gallery' => isset($body['gallery']) && is_array($body['gallery']) ? $body['gallery'] : null,
            'description' => Validator::sanitizeString($body['description'] ?? null),
        ];
    }

    private function formatOffice(array $row): array
    {
        $gallery = $row['gallery'] ? json_decode($row['gallery'], true) : [];
        return [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'address' => $row['address'],
            'phone' => $row['phone'],
            'phone2' => $row['phone2'] ?? null,
            'whatsapp' => $row['whatsapp'] ?? null,
            'image' => $row['image'] ?? null,
            'gallery' => $gallery ?: [],
            'locationUrl' => $row['location_url'] ?? null,
            'workingHours' => $row['working_hours'] ?? '',
            'isHeadquarters' => (bool)($row['is_headquarters'] ?? false),
            'city' => $row['city'] ?? '',
            'district' => $row['district'] ?? '',
            'description' => $row['description'] ?? null,
        ];
    }
}
