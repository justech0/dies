<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');
enable_cors();

$pdo = get_db_connection();

$data = [
    'users_total' => (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    'advisors' => (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'advisor'")->fetchColumn(),
    'listings_total' => (int)$pdo->query('SELECT COUNT(*) FROM listings')->fetchColumn(),
    'pending_listings' => (int)$pdo->query("SELECT COUNT(*) FROM listings WHERE status = 'pending'")->fetchColumn(),
    'sold_this_month' => (int)$pdo->query("SELECT COUNT(*) FROM listings WHERE status = 'sold' AND MONTH(updated_at) = MONTH(CURRENT_DATE()) AND YEAR(updated_at) = YEAR(CURRENT_DATE())")->fetchColumn(),
];

echo json_encode(['success' => true, 'data' => $data]);
?>
