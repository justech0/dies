<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $filters = [];
    if (!empty($_GET['status'])) {
        $filters['status'] = $_GET['status'];
    }
    if (!empty($_GET['featured'])) {
        $filters['featured'] = true;
    }
    if (!empty($_GET['user_id'])) {
        $filters['owner_user_id'] = (int)$_GET['user_id'];
    }

    $query = 'SELECT l.*, u.name AS owner_name, u.role AS owner_role, c.name AS consultant_name, c.avatar_path AS consultant_avatar, o.name AS office_name
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
    if (!empty($filters['owner_user_id'])) {
        $query .= ' AND l.owner_user_id = ?';
        $params[] = $filters['owner_user_id'];
    }

    $query .= ' ORDER BY l.created_at DESC';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $listings = $stmt->fetchAll();

    foreach ($listings as &$listing) {
        $imgStmt = $pdo->prepare('SELECT image_path FROM listing_images WHERE listing_id = ? ORDER BY sort_order');
        $imgStmt->execute([$listing['id']]);
        $listing['images'] = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
    }

    echo json_encode(['success' => true, 'data' => $listings]);
    exit();
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? 'create';
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $type = trim($_POST['type'] ?? '');
    $price = (float)($_POST['price'] ?? 0);
    $ownerId = (int)($_POST['user_id'] ?? 0);
    $province = trim($_POST['province'] ?? '');
    $district = trim($_POST['district'] ?? '');
    $neighborhood = trim($_POST['neighborhood'] ?? '');
    $status = $_POST['status'] ?? 'pending';
    $officeId = !empty($_POST['office_id']) ? (int)$_POST['office_id'] : null;
    $consultantId = !empty($_POST['consultant_id']) ? (int)$_POST['consultant_id'] : null;
    $requestConsultant = !empty($_POST['request_consultant']) ? 1 : 0;

    if (!$title || !$description || !$type || !$price || !$ownerId) {
        echo json_encode(['success' => false, 'message' => 'Zorunlu alanlar eksik.']);
        exit();
    }

    $pdo->beginTransaction();
    try {
        if ($action === 'update' && !empty($_POST['id'])) {
            $id = (int)$_POST['id'];
            $stmt = $pdo->prepare('UPDATE listings SET title = ?, description = ?, type = ?, price = ?, office_id = ?, consultant_id = ?, province = ?, district = ?, neighborhood = ?, request_consultant = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$title, $description, $type, $price, $officeId, $consultantId, $province, $district, $neighborhood, $requestConsultant, $id]);
            $listingId = $id;
        } else {
            $stmt = $pdo->prepare('INSERT INTO listings (title, description, type, price, status, owner_user_id, consultant_id, office_id, is_featured, province, district, neighborhood, request_consultant, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, NOW(), NOW())');
            // Consultant submissions auto-approve
            if ($consultantId && $status === 'pending') {
                $status = 'approved';
            }
            $stmt->execute([$title, $description, $type, $price, $status, $ownerId, $consultantId, $officeId, $province, $district, $neighborhood, $requestConsultant]);
            $listingId = (int)$pdo->lastInsertId();
        }

        if (!empty($_FILES['images']['name'][0])) {
            $imgStmt = $pdo->prepare('INSERT INTO listing_images (listing_id, image_path, sort_order) VALUES (?, ?, ?)');
            foreach ($_FILES['images']['tmp_name'] as $index => $tmpPath) {
                if (!is_uploaded_file($tmpPath)) {
                    continue;
                }
                $name = basename($_FILES['images']['name'][$index]);
                $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9\.\-_]/', '_', $name);
                $target = __DIR__ . '/../uploads/listings/' . $safeName;
                if (move_uploaded_file($tmpPath, $target)) {
                    $imgStmt->execute([$listingId, '/uploads/listings/' . $safeName, $index]);
                }
            }
        }

        $pdo->commit();
        log_activity($ownerId, 'user', $action === 'update' ? 'listing_updated' : 'listing_created');
        echo json_encode(['success' => true, 'id' => $listingId]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log($e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Kayıt sırasında hata oluştu.']);
    }
    exit();
}

echo json_encode(['success' => false, 'message' => 'Geçersiz istek.']);
?>
