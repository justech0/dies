<?php

namespace App\Controllers;

use PDO;
use App\Utils\Response;

class LocationController
{
    public static function cities(PDO $pdo): void
    {
        $stmt = $pdo->query('SELECT id, name FROM cities ORDER BY name');
        Response::success($stmt->fetchAll());
    }

    public static function districts(PDO $pdo, int $cityId): void
    {
        $stmt = $pdo->prepare('SELECT id, name FROM districts WHERE city_id = ? ORDER BY name');
        $stmt->execute([$cityId]);
        Response::success($stmt->fetchAll());
    }

    public static function towns(PDO $pdo, int $districtId): void
    {
        $stmt = $pdo->prepare('SELECT id, name FROM towns WHERE district_id = ? ORDER BY name');
        $stmt->execute([$districtId]);
        Response::success($stmt->fetchAll());
    }

    public static function neighborhoods(PDO $pdo, int $districtId, ?int $townId = null): void
    {
        $params = [$districtId];
        $townClause = '';
        if ($townId !== null) {
            $townClause = ' AND (town_id = ? OR town_id IS NULL)';
            $params[] = $townId;
        }
        $stmt = $pdo->prepare('SELECT id, name, town_id FROM neighborhoods WHERE district_id = ?' . $townClause . ' ORDER BY name');
        $stmt->execute($params);
        $neighborhoods = array_map(function ($row) {
            return [
                'id' => 'n-' . $row['id'],
                'raw_id' => (int)$row['id'],
                'name' => $row['name'],
                'kind' => 'neighborhood',
            ];
        }, $stmt->fetchAll());

        $stmt = $pdo->prepare('SELECT id, name, town_id FROM villages WHERE district_id = ?' . $townClause . ' ORDER BY name');
        $stmt->execute($params);
        $villages = array_map(function ($row) {
            return [
                'id' => 'v-' . $row['id'],
                'raw_id' => (int)$row['id'],
                'name' => $row['name'],
                'kind' => 'village',
            ];
        }, $stmt->fetchAll());

        Response::success(array_merge($neighborhoods, $villages));
    }

    public static function villages(PDO $pdo, int $districtId, ?int $townId = null): void
    {
        $params = [$districtId];
        $townClause = '';
        if ($townId !== null) {
            $townClause = ' AND (town_id = ? OR town_id IS NULL)';
            $params[] = $townId;
        }
        $stmt = $pdo->prepare('SELECT id, name, town_id FROM villages WHERE district_id = ?' . $townClause . ' ORDER BY name');
        $stmt->execute($params);
        $villages = array_map(function ($row) {
            return [
                'id' => 'v-' . $row['id'],
                'raw_id' => (int)$row['id'],
                'name' => $row['name'],
                'kind' => 'village',
            ];
        }, $stmt->fetchAll());
        Response::success($villages);
    }
}
