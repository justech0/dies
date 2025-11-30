<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');
enable_cors();

$pdo = get_db_connection();
$type = $_GET['type'] ?? null;
$parentId = isset($_GET['parent_id']) ? (int)$_GET['parent_id'] : null;

$query = 'SELECT id, name, parent_id, type FROM locations WHERE 1=1';
$params = [];

if ($type) {
    $query .= ' AND type = ?';
    $params[] = $type;
}
if ($parentId !== null) {
    $query .= ' AND parent_id ' . ($parentId ? '= ?' : 'IS NULL');
    if ($parentId) {
        $params[] = $parentId;
    }
}

$query .= ' ORDER BY name ASC';
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$rows = $stmt->fetchAll();

echo json_encode(['success' => true, 'data' => $rows]);
?>
