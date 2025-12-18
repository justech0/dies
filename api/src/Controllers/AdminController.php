<?php

namespace App\Controllers;

use App\Http\Response;
use PDO;

class AdminController extends BaseController
{
    public function stats(array $request = []): void
    {
        $totalProperties = $this->db->query('SELECT COUNT(*) as total FROM properties')->fetch();
        $pendingProperties = $this->db->query("SELECT COUNT(*) as total FROM properties WHERE listing_status = 'pending'")->fetch();
        $activeProperties = $this->db->query("SELECT COUNT(*) as total FROM properties WHERE listing_status = 'approved' AND listing_state = 'active'")->fetch();
        $totalUsers = $this->db->query('SELECT COUNT(*) as total FROM users')->fetch();
        $totalAdvisors = $this->db->query("SELECT COUNT(*) as total FROM users WHERE role = 'advisor'")->fetch();
        $totalOffices = $this->db->query('SELECT COUNT(*) as total FROM offices')->fetch();

        Response::success([
            'totalProperties' => (int)($totalProperties['total'] ?? 0),
            'pendingProperties' => (int)($pendingProperties['total'] ?? 0),
            'activeProperties' => (int)($activeProperties['total'] ?? 0),
            'totalUsers' => (int)($totalUsers['total'] ?? 0),
            'totalAdvisors' => (int)($totalAdvisors['total'] ?? 0),
            'totalOffices' => (int)($totalOffices['total'] ?? 0),
        ]);
    }

    public function pendingProperties(array $request = []): void
    {
        $stmt = $this->db->query("SELECT p.*, u.name AS advisor_name, u.phone AS advisor_phone, u.image AS advisor_image FROM properties p LEFT JOIN users u ON p.advisor_id = u.id WHERE p.listing_status = 'pending' ORDER BY p.created_at DESC");
        $data = [];
        while ($row = $stmt->fetch()) {
            $data[] = $this->formatProperty($row);
        }
        Response::success($data);
    }

    public function approveProperty(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $stmt = $this->db->prepare("UPDATE properties SET listing_status = 'approved', listing_state = 'active', rejection_reason = NULL, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            Response::error('İlan bulunamadı', 404);
        }
        Response::success(['message' => 'İlan onaylandı']);
    }

    public function rejectProperty(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $reason = $request['body']['reason'] ?? null;
        $stmt = $this->db->prepare("UPDATE properties SET listing_status = 'rejected', rejection_reason = :reason, updated_at = NOW() WHERE id = :id");
        $stmt->execute([':reason' => $reason, ':id' => $id]);
        if ($stmt->rowCount() === 0) {
            Response::error('İlan bulunamadı', 404);
        }
        Response::success(['message' => 'İlan reddedildi']);
    }

    public function users(): void
    {
        $stmt = $this->db->query('SELECT id, name, email, phone, role, image, instagram, facebook, created_at FROM users ORDER BY created_at DESC');
        $users = $stmt->fetchAll();
        $data = array_map(function ($user) {
            return [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'role' => $user['role'],
                'type' => $user['role'],
                'image' => $user['image'] ?? null,
                'instagram' => $user['instagram'] ?? null,
                'facebook' => $user['facebook'] ?? null,
                'date' => $user['created_at'] ?? null,
            ];
        }, $users);

        Response::success($data);
    }

    public function updateUserRole(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $role = $request['body']['role'] ?? '';

        if (!in_array($role, ['admin', 'advisor', 'user'], true)) {
            Response::error('Geçersiz rol', 422);
        }

        $stmt = $this->db->prepare('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$role, $id]);
        if ($stmt->rowCount() === 0) {
            Response::error('Kullanıcı bulunamadı', 404);
        }
        Response::success(['message' => 'Rol güncellendi']);
    }

    public function resetPassword(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $generated = $this->generatePassword();
        $hash = password_hash($generated, PASSWORD_DEFAULT);

        $stmt = $this->db->prepare('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$hash, $id]);
        if ($stmt->rowCount() === 0) {
            Response::error('Kullanıcı bulunamadı', 404);
        }

        Response::success(['generatedPassword' => $generated]);
    }

    public function applications(array $request): void
    {
        $type = $request['query']['type'] ?? null;
        if (!in_array($type, ['advisor', 'office'], true)) {
            Response::error('Geçersiz başvuru tipi', 422);
        }

        $stmt = $this->db->prepare('SELECT * FROM applications WHERE type = ? ORDER BY created_at DESC');
        $stmt->execute([$type]);
        $apps = [];
        while ($row = $stmt->fetch()) {
            $apps[] = $this->formatApplication($row);
        }

        Response::success($apps);
    }

    public function manageApplication(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $status = $request['body']['status'] ?? null;
        if (!in_array($status, ['approved', 'rejected', 'pending'], true)) {
            Response::error('Geçersiz durum', 422);
        }

        $stmt = $this->db->prepare('UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$status, $id]);
        if ($stmt->rowCount() === 0) {
            Response::error('Başvuru bulunamadı', 404);
        }
        Response::success(['message' => 'Başvuru güncellendi']);
    }

    private function formatProperty(array $row): array
    {
        $images = $row['images'] ? json_decode($row['images'], true) : [];
        $features = $row['features'] ? json_decode($row['features'], true) : [];
        $type = $this->resolveType($row['listing_status'], $row['listing_state'], $row['listing_intent']);

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
            'type' => $type,
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

    private function formatApplication(array $row): array
    {
        $details = $row['details'] ? json_decode($row['details'], true) : [];
        return [
            'id' => (int)$row['id'],
            'type' => $row['type'],
            'firstName' => $row['first_name'],
            'lastName' => $row['last_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'city' => $row['city'],
            'status' => $row['status'],
            'profession' => $details['profession'] ?? null,
            'education' => $details['education'] ?? null,
            'experience' => $details['experience'] ?? null,
            'birthDate' => $details['birthDate'] ?? null,
            'budget' => $details['budget'] ?? null,
            'details' => $details['details'] ?? null,
            'date' => $row['created_at'],
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

    private function generatePassword(int $length = 10): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $password;
    }
}
