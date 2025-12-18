<?php

namespace App\Controllers;

use App\Http\Response;
use PDO;

class AdvisorController extends BaseController
{
    public function list(array $request = []): void
    {
        $stmt = $this->db->query("SELECT u.id, u.name, u.phone, u.role, u.image, u.instagram, u.facebook, a.is_founder, a.about, a.specializations, a.sahibinden_link, a.experience_years, a.total_sales FROM users u INNER JOIN advisors a ON u.id = a.user_id WHERE u.role = 'advisor'");
        $advisors = [];
        while ($row = $stmt->fetch()) {
            $advisors[] = $this->formatAdvisor($row);
        }
        Response::success($advisors);
    }

    public function detail(array $request): void
    {
        $id = (int)($request['params']['id'] ?? 0);
        $stmt = $this->db->prepare("SELECT u.id, u.name, u.phone, u.role, u.image, u.instagram, u.facebook, a.is_founder, a.about, a.specializations, a.sahibinden_link, a.experience_years, a.total_sales FROM users u INNER JOIN advisors a ON u.id = a.user_id WHERE u.id = ? AND u.role = 'advisor' LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Danışman bulunamadı', 404);
        }

        Response::success($this->formatAdvisor($row));
    }

    private function formatAdvisor(array $row): array
    {
        $specializations = $row['specializations'] ? json_decode($row['specializations'], true) : [];
        $activeListings = $this->activeListings((int)$row['id']);

        return [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'role' => $row['role'],
            'phone' => $row['phone'],
            'image' => $row['image'] ?? null,
            'isFounder' => (bool)($row['is_founder'] ?? false),
            'about' => $row['about'] ?? null,
            'specializations' => $specializations ?: [],
            'sahibindenLink' => $row['sahibinden_link'] ?? null,
            'social' => [
                'instagram' => $row['instagram'] ?? null,
                'facebook' => $row['facebook'] ?? null,
            ],
            'stats' => [
                'totalSales' => (int)($row['total_sales'] ?? 0),
                'activeListings' => $activeListings,
                'experience' => (int)($row['experience_years'] ?? 0),
            ],
        ];
    }

    private function activeListings(int $advisorId): int
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM properties WHERE advisor_id = ? AND listing_status = 'approved' AND listing_state = 'active'");
        $stmt->execute([$advisorId]);
        $row = $stmt->fetch();
        return (int)($row['total'] ?? 0);
    }
}
