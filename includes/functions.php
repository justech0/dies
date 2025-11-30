<?php
require_once __DIR__ . '/../config.php';

function fetch_listings(array $filters = []): array
{
    $pdo = get_db_connection();
    $query = 'SELECT l.*, u.name AS owner_name, u.role AS owner_role, c.name AS consultant_name, o.name AS office_name
              FROM listings l
              LEFT JOIN users u ON l.owner_user_id = u.id
              LEFT JOIN users c ON l.consultant_id = c.id
              LEFT JOIN offices o ON l.office_id = o.id WHERE 1=1';
    $params = [];

    if (!empty($filters['status'])) {
        $query .= ' AND l.status = ?';
        $params[] = $filters['status'];
    }

    if (!empty($filters['featured'])) {
        $query .= ' AND l.is_featured = 1';
    }

    if (!empty($filters['consultant_id'])) {
        $query .= ' AND l.consultant_id = ?';
        $params[] = $filters['consultant_id'];
    }

    if (!empty($filters['owner_user_id'])) {
        $query .= ' AND l.owner_user_id = ?';
        $params[] = $filters['owner_user_id'];
    }

    $query .= ' ORDER BY l.created_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function fetch_consultants(): array
{
    $pdo = get_db_connection();
    $stmt = $pdo->query("SELECT id, name, email, phone, about, avatar_path FROM users WHERE role = 'consultant' ORDER BY created_at DESC");
    return $stmt->fetchAll();
}

function fetch_offices(): array
{
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT * FROM offices ORDER BY created_at DESC');
    return $stmt->fetchAll();
}
?>
