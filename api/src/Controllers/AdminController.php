<?php

namespace App\Controllers;

use PDO;
use App\Utils\Response;

class AdminController
{
    public static function stats(PDO $pdo): void
    {
        $totalListings = (int)$pdo->query('SELECT COUNT(*) FROM properties WHERE deleted_at IS NULL')->fetchColumn();
        $pendingListings = (int)$pdo->query('SELECT COUNT(*) FROM properties WHERE listing_status = "pending" AND deleted_at IS NULL')->fetchColumn();
        $users = (int)$pdo->query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL')->fetchColumn();
        $applications = (int)$pdo->query('SELECT COUNT(*) FROM applications')->fetchColumn();
        Response::success([
            'totalListings' => $totalListings,
            'pendingListings' => $pendingListings,
            'userCount' => $users,
            'applications' => $applications,
        ]);
    }

    public static function pendingProperties(PDO $pdo): void
    {
        $stmt = $pdo->query('SELECT * FROM properties WHERE listing_status = "pending" AND deleted_at IS NULL ORDER BY created_at DESC');
        Response::success($stmt->fetchAll());
    }

    public static function approveProperty(PDO $pdo, int $id, ?int $adminId = null): void
    {
        $advisorId = getenv('DEFAULT_ADVISOR_ID');
        if (!$advisorId) {
            $stmt = $pdo->query('SELECT user_id FROM advisors LIMIT 1');
            $advisorId = $stmt->fetchColumn() ?: null;
        }
        $stmt = $pdo->prepare('UPDATE properties SET listing_status = "approved", advisor_id = COALESCE(advisor_id, ?), approved_at = NOW(), approved_by = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$advisorId, $adminId, $id]);
        Response::success(['message' => 'İlan onaylandı.']);
    }

    public static function rejectProperty(PDO $pdo, int $id, ?string $reason): void
    {
        $stmt = $pdo->prepare('UPDATE properties SET listing_status = "rejected", rejection_reason = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$reason, $id]);
        Response::success(['message' => 'İlan reddedildi.']);
    }

    public static function listUsers(PDO $pdo): void
    {
        $stmt = $pdo->query('SELECT id, name, email, phone, role, image, instagram, facebook, created_at FROM users WHERE deleted_at IS NULL ORDER BY id DESC');
        Response::success($stmt->fetchAll());
    }

    public static function changeRole(PDO $pdo, int $id, string $role): void
    {
        $allowed = ['admin','advisor','user'];
        if (!in_array($role, $allowed, true)) {
            Response::error(400, 'Geçersiz rol.');
        }
        $stmt = $pdo->prepare('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$role, $id]);
        if ($role === 'advisor') {
            $stmt = $pdo->prepare('SELECT user_id FROM advisors WHERE user_id = ?');
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                $pdo->prepare('INSERT INTO advisors (user_id) VALUES (?)')->execute([$id]);
            }
        }
        Response::success(['message' => 'Rol güncellendi.']);
    }

    public static function resetPassword(PDO $pdo, int $id): void
    {
        $newPassword = bin2hex(random_bytes(4));
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$hash, $id]);
        Response::success(['generatedPassword' => $newPassword]);
    }

    public static function advisors(PDO $pdo): void
    {
        $stmt = $pdo->query('SELECT u.id, u.name, u.email, u.phone, u.role, u.image, a.about, a.specializations, a.sahibinden_link, a.experience_years, a.total_sales, a.is_founder, a.title FROM users u LEFT JOIN advisors a ON u.id = a.user_id WHERE u.role = "advisor" AND u.deleted_at IS NULL ORDER BY u.id DESC');
        $rows = $stmt->fetchAll();
        $data = array_map(function ($row) {
            $row['specializations'] = json_decode($row['specializations'] ?? '[]', true) ?: [];
            $row['is_founder'] = !empty($row['is_founder']);
            return $row;
        }, $rows);
        Response::success($data);
    }

    public static function updateAdvisor(PDO $pdo, int $userId, array $payload): void
    {
        $stmt = $pdo->prepare('SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if (!$user || $user['role'] !== 'advisor') {
            Response::error(404, 'Danışman bulunamadı.');
        }

        $about = $payload['about'] ?? null;
        $specializations = $payload['specializations'] ?? [];
        if (!is_array($specializations)) {
            $specializations = [];
        }
        $sahibinden = $payload['sahibinden_link'] ?? null;
        $experience = $payload['experience_years'] ?? 0;
        $totalSales = $payload['total_sales'] ?? 0;
        $isFounder = !empty($payload['is_founder']);
        $title = $payload['title'] ?? null;

        $stmt = $pdo->prepare('SELECT user_id FROM advisors WHERE user_id = ?');
        $stmt->execute([$userId]);
        if ($stmt->fetch()) {
            $stmt = $pdo->prepare('UPDATE advisors SET about = ?, specializations = ?, sahibinden_link = ?, experience_years = ?, total_sales = ?, is_founder = ?, title = ?, updated_at = NOW() WHERE user_id = ?');
            $stmt->execute([$about, json_encode($specializations), $sahibinden, $experience, $totalSales, $isFounder ? 1 : 0, $title, $userId]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO advisors (user_id, about, specializations, sahibinden_link, experience_years, total_sales, is_founder, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$userId, $about, json_encode($specializations), $sahibinden, $experience, $totalSales, $isFounder ? 1 : 0, $title]);
        }
        Response::success(['message' => 'Danışman güncellendi.']);
    }

    public static function applications(PDO $pdo, ?string $type = null): void
    {
        $sql = 'SELECT * FROM applications';
        $params = [];
        if ($type) {
            $sql .= ' WHERE type = ?';
            $params[] = $type;
        }
        $sql .= ' ORDER BY created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $data = array_map(function ($row) {
            $row['details'] = json_decode($row['details'] ?? '{}', true);
            return $row;
        }, $rows);
        Response::success($data);
    }

    public static function updateApplication(PDO $pdo, int $id, string $status): void
    {
        $allowed = ['pending','reviewed','approved','rejected'];
        if (!in_array($status, $allowed, true)) {
            Response::error(400, 'Geçersiz durum.');
        }
        $stmt = $pdo->prepare('UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$status, $id]);
        Response::success(['message' => 'Başvuru güncellendi.']);
    }
}
