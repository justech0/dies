<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_admin();

$pdo = get_db_connection();
$consultants = fetch_consultants();
$offices = fetch_offices();
$editing = null;

if (!empty($_GET['id'])) {
    $stmt = $pdo->prepare('SELECT * FROM listings WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_GET['id']]);
    $editing = $stmt->fetch();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $type = $_POST['type'] ?? '';
    $price = (float)($_POST['price'] ?? 0);
    $status = $_POST['status'] ?? 'approved';
    $ownerId = (int)($_POST['owner_user_id'] ?? current_user()['id']);
    $consultantId = !empty($_POST['consultant_id']) ? (int)$_POST['consultant_id'] : null;
    $officeId = !empty($_POST['office_id']) ? (int)$_POST['office_id'] : null;
    $isFeatured = !empty($_POST['is_featured']) ? 1 : 0;

    if ($editing) {
        $stmt = $pdo->prepare('UPDATE listings SET title=?, description=?, type=?, price=?, status=?, owner_user_id=?, consultant_id=?, office_id=?, is_featured=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([$title, $description, $type, $price, $status, $ownerId, $consultantId, $officeId, $isFeatured, $editing['id']]);
        $listingId = $editing['id'];
    } else {
        $stmt = $pdo->prepare('INSERT INTO listings (title, description, type, price, status, owner_user_id, consultant_id, office_id, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$title, $description, $type, $price, $status, $ownerId, $consultantId, $officeId, $isFeatured]);
        $listingId = (int)$pdo->lastInsertId();
    }
    log_activity(current_user()['id'], 'admin', $editing ? 'listing_updated' : 'listing_created_admin');
    header('Location: /admin/listings.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title><?php echo $editing ? 'İlanı Düzenle' : 'Yeni İlan'; ?></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
    <div class="max-w-3xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4"><?php echo $editing ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'; ?></h1>
        <form method="POST" class="space-y-4 bg-white p-6 rounded shadow">
            <div>
                <label class="block text-sm font-medium">Başlık</label>
                <input type="text" name="title" required value="<?php echo sanitize($editing['title'] ?? ''); ?>" class="w-full border p-3 rounded" />
            </div>
            <div>
                <label class="block text-sm font-medium">Açıklama</label>
                <textarea name="description" required rows="4" class="w-full border p-3 rounded"><?php echo sanitize($editing['description'] ?? ''); ?></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium">Tip</label>
                    <select name="type" class="border p-3 rounded w-full">
                        <?php $types = ['Satılık', 'Kiralık', 'Satıldı', 'Kiralandı'];
                        foreach ($types as $typeOption): ?>
                            <option value="<?php echo $typeOption; ?>" <?php echo ($editing['type'] ?? '') === $typeOption ? 'selected' : ''; ?>><?php echo $typeOption; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium">Fiyat</label>
                    <input type="number" name="price" required value="<?php echo sanitize($editing['price'] ?? ''); ?>" class="w-full border p-3 rounded" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium">Durum</label>
                    <select name="status" class="border p-3 rounded w-full">
                        <option value="approved" <?php echo ($editing['status'] ?? '') === 'approved' ? 'selected' : ''; ?>>Onaylı</option>
                        <option value="pending" <?php echo ($editing['status'] ?? '') === 'pending' ? 'selected' : ''; ?>>Bekleyen</option>
                        <option value="rejected" <?php echo ($editing['status'] ?? '') === 'rejected' ? 'selected' : ''; ?>>Reddedildi</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium">Danışman</label>
                    <select name="consultant_id" class="border p-3 rounded w-full">
                        <option value="">Seçiniz</option>
                        <?php foreach ($consultants as $c): ?>
                            <option value="<?php echo $c['id']; ?>" <?php echo ($editing['consultant_id'] ?? '') == $c['id'] ? 'selected' : ''; ?>><?php echo sanitize($c['name']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium">Ofis</label>
                    <select name="office_id" class="border p-3 rounded w-full">
                        <option value="">Seçiniz</option>
                        <?php foreach ($offices as $o): ?>
                            <option value="<?php echo $o['id']; ?>" <?php echo ($editing['office_id'] ?? '') == $o['id'] ? 'selected' : ''; ?>><?php echo sanitize($o['name']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <input type="checkbox" id="is_featured" name="is_featured" value="1" <?php echo !empty($editing['is_featured']) ? 'checked' : ''; ?> />
                <label for="is_featured">Öne Çıkan</label>
            </div>
            <div>
                <label class="block text-sm font-medium">Sahip Kullanıcı ID</label>
                <input type="number" name="owner_user_id" value="<?php echo sanitize($editing['owner_user_id'] ?? ''); ?>" class="w-full border p-3 rounded" />
            </div>
            <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded">Kaydet</button>
        </form>
    </div>
</body>
</html>
