<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');
enable_cors();

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

function ensureUploadsFolder(string $folder): void
{
    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }
}

function saveListingImages(int $listingId, array $files, PDO $pdo): void
{
    ensureUploadsFolder(__DIR__ . '/../uploads/listings/');
    $stmt = $pdo->prepare('INSERT INTO listing_images (listing_id, image_url, is_cover, sort_order) VALUES (?, ?, ?, ?)');
    foreach ($files['tmp_name'] as $index => $tmpPath) {
        if (!is_uploaded_file($tmpPath)) {
            continue;
        }
        $name = basename($files['name'][$index]);
        $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9\.\-_]/', '_', $name);
        $target = __DIR__ . '/../uploads/listings/' . $safeName;
        if (compressImage($tmpPath, $target)) {
            $isCover = !empty($files['is_cover'][$index]) || $index === 0 ? 1 : 0;
            $stmt->execute([$listingId, '/uploads/listings/' . $safeName, $isCover, $index]);
        }
    }
}

function deleteListingImages(int $listingId, PDO $pdo): void
{
    $paths = $pdo->prepare('SELECT image_url FROM listing_images WHERE listing_id = ?');
    $paths->execute([$listingId]);
    foreach ($paths->fetchAll(PDO::FETCH_COLUMN) as $path) {
        $fullPath = __DIR__ . '/..' . $path;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
    $pdo->prepare('DELETE FROM listing_images WHERE listing_id = ?')->execute([$listingId]);
}

if ($method === 'GET' && ($_GET['action'] ?? 'get_all') === 'get_one') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID eksik']);
        exit();
    }
    $pdo->prepare('UPDATE listings SET view_count = view_count + 1 WHERE id = ?')->execute([$id]);
    $stmt = $pdo->prepare('SELECT l.*, u.name AS user_name, u.image AS user_image, u.role AS user_role FROM listings l JOIN users u ON l.user_id = u.id WHERE l.id = ?');
    $stmt->execute([$id]);
    $listing = $stmt->fetch();
    if (!$listing) {
        echo json_encode(['success' => false, 'message' => 'Kayıt bulunamadı']);
        exit();
    }

    $detailStmt = $pdo->prepare('SELECT * FROM listing_details WHERE listing_id = ?');
    $detailStmt->execute([$id]);
    $listing['details'] = $detailStmt->fetch();

    $images = $pdo->prepare('SELECT image_url, is_cover, sort_order FROM listing_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order ASC');
    $images->execute([$id]);
    $listing['images'] = $images->fetchAll();

    echo json_encode(['success' => true, 'data' => $listing]);
    exit();
}

if ($method === 'GET') {
    $query = 'SELECT l.*, u.name AS user_name, u.image AS user_image, u.role AS user_role FROM listings l JOIN users u ON l.user_id = u.id WHERE 1=1';
    $params = [];

    if (!empty($_GET['province'])) {
        $query .= ' AND EXISTS (SELECT 1 FROM listing_details d WHERE d.listing_id = l.id AND d.province = ?)';
        $params[] = $_GET['province'];
    }
    if (!empty($_GET['district'])) {
        $query .= ' AND EXISTS (SELECT 1 FROM listing_details d WHERE d.listing_id = l.id AND d.district = ?)';
        $params[] = $_GET['district'];
    }
    if (!empty($_GET['min_price'])) {
        $query .= ' AND l.price >= ?';
        $params[] = (float)$_GET['min_price'];
    }
    if (!empty($_GET['max_price'])) {
        $query .= ' AND l.price <= ?';
        $params[] = (float)$_GET['max_price'];
    }
    if (!empty($_GET['bedrooms'])) {
        $query .= ' AND EXISTS (SELECT 1 FROM listing_details d WHERE d.listing_id = l.id AND d.bedrooms = ?)';
        $params[] = $_GET['bedrooms'];
    }
    if (!empty($_GET['area_min'])) {
        $query .= ' AND EXISTS (SELECT 1 FROM listing_details d WHERE d.listing_id = l.id AND d.area_gross >= ?)';
        $params[] = (int)$_GET['area_min'];
    }
    if (!empty($_GET['area_max'])) {
        $query .= ' AND EXISTS (SELECT 1 FROM listing_details d WHERE d.listing_id = l.id AND d.area_gross <= ?)';
        $params[] = (int)$_GET['area_max'];
    }
    if (!empty($_GET['keyword'])) {
        $query .= ' AND (l.title LIKE ? OR l.description LIKE ?)';
        $keyword = '%' . $_GET['keyword'] . '%';
        $params[] = $keyword;
        $params[] = $keyword;
    }
    if (!empty($_GET['status'])) {
        $query .= ' AND l.status = ?';
        $params[] = $_GET['status'];
    }
    if (!empty($_GET['featured'])) {
        $query .= ' AND l.is_featured = 1';
    }

    $query .= ' ORDER BY l.created_at DESC';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $listings = $stmt->fetchAll();

    $imgStmt = $pdo->prepare('SELECT image_url, is_cover FROM listing_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order');
    foreach ($listings as &$listing) {
        $imgStmt->execute([$listing['id']]);
        $listing['images'] = $imgStmt->fetchAll();
    }

    echo json_encode(['success' => true, 'data' => $listings]);
    exit();
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? 'create';

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID eksik']);
            exit();
        }
        deleteListingImages($id, $pdo);
        $pdo->prepare('DELETE FROM listing_details WHERE listing_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM listings WHERE id = ?')->execute([$id]);
        echo json_encode(['success' => true]);
        exit();
    }

    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = (float)($_POST['price'] ?? 0);
    $currency = $_POST['currency'] ?? 'TL';
    $type = $_POST['type'] ?? 'satilik';
    $category = $_POST['category'] ?? 'konut';
    $status = $_POST['status'] ?? 'pending';
    $userId = (int)($_POST['user_id'] ?? 0);
    $isFeatured = !empty($_POST['is_featured']) ? 1 : 0;

    $details = [
        'province' => $_POST['province'] ?? null,
        'district' => $_POST['district'] ?? null,
        'neighborhood' => $_POST['neighborhood'] ?? null,
        'bedrooms' => $_POST['bedrooms'] ?? null,
        'bathrooms' => $_POST['bathrooms'] ?? null,
        'area_gross' => $_POST['area_gross'] ?? null,
        'area_net' => $_POST['area_net'] ?? null,
        'floor_location' => $_POST['floor_location'] ?? null,
        'total_floors' => $_POST['total_floors'] ?? null,
        'heating_type' => $_POST['heating_type'] ?? null,
        'building_age' => $_POST['building_age'] ?? null,
        'is_furnished' => !empty($_POST['is_furnished']) ? 1 : 0,
        'balcony_count' => $_POST['balcony_count'] ?? null,
        'sahibinden_link' => $_POST['sahibinden_link'] ?? null,
        'features' => !empty($_POST['features']) ? json_decode($_POST['features'], true) : null,
    ];

    if (!$title || !$description || !$price || !$userId) {
        echo json_encode(['success' => false, 'message' => 'Zorunlu alanlar eksik.']);
        exit();
    }

    if ($action === 'update' && !empty($_POST['id'])) {
        $id = (int)$_POST['id'];
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('UPDATE listings SET title = ?, slug = ?, description = ?, price = ?, currency = ?, type = ?, category = ?, status = ?, is_featured = ?, updated_at = NOW() WHERE id = ?');
            $slug = $_POST['slug'] ?? strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
            $stmt->execute([$title, $slug, $description, $price, $currency, $type, $category, $status, $isFeatured, $id]);

            $pdo->prepare('REPLACE INTO listing_details (listing_id, province, district, neighborhood, bedrooms, bathrooms, area_gross, area_net, floor_location, total_floors, heating_type, building_age, is_furnished, balcony_count, sahibinden_link, features)
                           VALUES (:listing_id, :province, :district, :neighborhood, :bedrooms, :bathrooms, :area_gross, :area_net, :floor_location, :total_floors, :heating_type, :building_age, :is_furnished, :balcony_count, :sahibinden_link, :features)')
                ->execute([
                    'listing_id' => $id,
                    'province' => $details['province'],
                    'district' => $details['district'],
                    'neighborhood' => $details['neighborhood'],
                    'bedrooms' => $details['bedrooms'],
                    'bathrooms' => $details['bathrooms'],
                    'area_gross' => $details['area_gross'],
                    'area_net' => $details['area_net'],
                    'floor_location' => $details['floor_location'],
                    'total_floors' => $details['total_floors'],
                    'heating_type' => $details['heating_type'],
                    'building_age' => $details['building_age'],
                    'is_furnished' => $details['is_furnished'],
                    'balcony_count' => $details['balcony_count'],
                    'sahibinden_link' => $details['sahibinden_link'],
                    'features' => $details['features'] ? json_encode($details['features']) : null,
                ]);

            if (!empty($_FILES['images']['name'][0])) {
                deleteListingImages($id, $pdo);
                saveListingImages($id, $_FILES['images'], $pdo);
            }

            $pdo->commit();
            log_activity($userId, 'advisor', 'listing_updated');
            echo json_encode(['success' => true, 'id' => $id]);
        } catch (Throwable $e) {
            $pdo->rollBack();
            error_log($e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Kayıt sırasında hata oluştu.']);
        }
        exit();
    }

    $pdo->beginTransaction();
    try {
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
        $stmt = $pdo->prepare('INSERT INTO listings (user_id, title, slug, description, price, currency, type, category, status, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$userId, $title, $slug, $description, $price, $currency, $type, $category, $status, $isFeatured]);
        $listingId = (int)$pdo->lastInsertId();

        $detailStmt = $pdo->prepare('INSERT INTO listing_details (listing_id, province, district, neighborhood, bedrooms, bathrooms, area_gross, area_net, floor_location, total_floors, heating_type, building_age, is_furnished, balcony_count, sahibinden_link, features)
            VALUES (:listing_id, :province, :district, :neighborhood, :bedrooms, :bathrooms, :area_gross, :area_net, :floor_location, :total_floors, :heating_type, :building_age, :is_furnished, :balcony_count, :sahibinden_link, :features)');
        $detailStmt->execute([
            'listing_id' => $listingId,
            'province' => $details['province'],
            'district' => $details['district'],
            'neighborhood' => $details['neighborhood'],
            'bedrooms' => $details['bedrooms'],
            'bathrooms' => $details['bathrooms'],
            'area_gross' => $details['area_gross'],
            'area_net' => $details['area_net'],
            'floor_location' => $details['floor_location'],
            'total_floors' => $details['total_floors'],
            'heating_type' => $details['heating_type'],
            'building_age' => $details['building_age'],
            'is_furnished' => $details['is_furnished'],
            'balcony_count' => $details['balcony_count'],
            'sahibinden_link' => $details['sahibinden_link'],
            'features' => $details['features'] ? json_encode($details['features']) : null,
        ]);

        if (!empty($_FILES['images']['name'][0])) {
            saveListingImages($listingId, $_FILES['images'], $pdo);
        }

        $pdo->commit();
        log_activity($userId, 'advisor', 'listing_created');
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
