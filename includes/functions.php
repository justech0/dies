<?php
require_once __DIR__ . '/../config.php';

function fetch_listings(array $filters = []): array
{
    $pdo = get_db_connection();
    $query = 'SELECT l.*, u.name AS owner_name, u.role AS owner_role
              FROM listings l
              LEFT JOIN users u ON l.user_id = u.id WHERE 1=1';
    $params = [];

    if (!empty($filters['status'])) {
        $query .= ' AND l.status = ?';
        $params[] = $filters['status'];
    }

    if (!empty($filters['featured'])) {
        $query .= ' AND l.is_featured = 1';
    }

    if (!empty($filters['user_id'])) {
        $query .= ' AND l.user_id = ?';
        $params[] = $filters['user_id'];
    }

    $query .= ' ORDER BY l.created_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function fetch_consultants(): array
{
    $pdo = get_db_connection();
    $stmt = $pdo->query("SELECT id, name, email, phone, about, image AS avatar_path FROM users WHERE role = 'advisor' ORDER BY created_at DESC");
    return $stmt->fetchAll();
}

function fetch_offices(): array
{
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT * FROM offices ORDER BY created_at DESC');
    return $stmt->fetchAll();
}
?>
