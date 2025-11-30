<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$pdo = get_db_connection();

$counts = [
    'users' => (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    'consultants' => (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'consultant'")->fetchColumn(),
    'listings' => (int)$pdo->query('SELECT COUNT(*) FROM listings')->fetchColumn(),
    'pending_listings' => (int)$pdo->query("SELECT COUNT(*) FROM listings WHERE status = 'pending'")->fetchColumn(),
];

echo json_encode(['success' => true, 'data' => $counts]);
?>
