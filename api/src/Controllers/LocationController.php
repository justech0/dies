<?php

namespace App\Controllers;

use App\Http\Response;
use PDO;

class LocationController extends BaseController
{
    public function cities(array $request = []): void
    {
        $stmt = $this->db->query('SELECT id, name FROM location_cities ORDER BY name');
        $data = $stmt->fetchAll();
        header('Cache-Control: public, max-age=86400');
        Response::success($data);
    }

    public function districts(array $request): void
    {
        $cityId = (int)($request['query']['city_id'] ?? 0);
        $stmt = $this->db->prepare('SELECT id, name, city_id FROM location_districts WHERE city_id = ? ORDER BY name');
        $stmt->execute([$cityId]);
        $data = $stmt->fetchAll();
        header('Cache-Control: public, max-age=86400');
        Response::success($data);
    }

    public function neighborhoods(array $request): void
    {
        $districtId = (int)($request['query']['district_id'] ?? 0);
        $stmt = $this->db->prepare('SELECT id, name, district_id FROM location_neighborhoods WHERE district_id = ? ORDER BY name');
        $stmt->execute([$districtId]);
        $data = $stmt->fetchAll();
        header('Cache-Control: public, max-age=86400');
        Response::success($data);
    }
}
