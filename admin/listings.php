<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_admin();

$pdo = get_db_connection();
$statusFilter = $_GET['status'] ?? '';
$filters = [];
if ($statusFilter) {
    $filters['status'] = $statusFilter;
}
$listings = fetch_listings($filters);
$consultants = fetch_consultants();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_POST['toggle_featured'])) {
        $id = (int)$_POST['toggle_featured'];
        $stmt = $pdo->prepare('UPDATE listings SET is_featured = CASE WHEN is_featured = 1 THEN 0 ELSE 1 END WHERE id = ?');
        $stmt->execute([$id]);
        header('Location: listings.php');
        exit();
    }

    if (!empty($_POST['update_status'])) {
        $id = (int)$_POST['listing_id'];
        $status = $_POST['status'] ?? 'pending';
        $consultantId = !empty($_POST['consultant_id']) ? (int)$_POST['consultant_id'] : null;
        $stmt = $pdo->prepare('UPDATE listings SET status = ?, consultant_id = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$status, $consultantId, $id]);
        log_activity(current_user()['id'], 'admin', 'listing_' . $status);
        header('Location: listings.php');
        exit();
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>İlan Yönetimi</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">İlan Yönetimi</h1>
            <div class="space-x-2">
                <a href="/admin/index.php" class="text-sm text-gray-600">Geri</a>
                <a href="/admin/new_listing.php" class="bg-red-600 text-white px-4 py-2 rounded">Yeni İlan</a>
            </div>
        </div>
        <form method="GET" class="mb-4 space-x-2">
            <select name="status" class="border p-2 rounded">
                <option value="">Tümü</option>
                <option value="pending" <?php echo $statusFilter==='pending'?'selected':''; ?>>Bekleyen</option>
                <option value="approved" <?php echo $statusFilter==='approved'?'selected':''; ?>>Onaylı</option>
                <option value="rejected" <?php echo $statusFilter==='rejected'?'selected':''; ?>>Reddedilen</option>
            </select>
            <button type="submit" class="px-3 py-2 bg-gray-800 text-white rounded">Filtrele</button>
        </form>
        <div class="bg-white shadow rounded overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-3 text-left">Başlık</th>
                        <th class="p-3 text-left">Fiyat</th>
                        <th class="p-3 text-left">Durum</th>
                        <th class="p-3 text-left">Sahip</th>
                        <th class="p-3 text-left">Danışman</th>
                        <th class="p-3 text-left">Öne Çıkan</th>
                        <th class="p-3">Aksiyon</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($listings as $listing): ?>
                    <tr class="border-b">
                        <td class="p-3">
                            <div class="font-semibold"><?php echo sanitize($listing['title']); ?></div>
                            <div class="text-xs text-gray-500"><?php echo sanitize($listing['province'] . ' ' . $listing['district']); ?></div>
                        </td>
                        <td class="p-3"><?php echo number_format((float)$listing['price'], 0, ',', '.'); ?> TL</td>
                        <td class="p-3 capitalize"><?php echo sanitize($listing['status']); ?></td>
                        <td class="p-3">
                            <div class="font-medium"><?php echo sanitize($listing['owner_name'] ?? ''); ?></div>
                            <div class="text-xs text-gray-500"><?php echo sanitize($listing['owner_role'] ?? ''); ?></div>
                        </td>
                        <td class="p-3 text-sm"><?php echo sanitize($listing['consultant_name'] ?? 'Belirtilmedi'); ?></td>
                        <td class="p-3 text-center">
                            <form method="POST">
                                <input type="hidden" name="toggle_featured" value="<?php echo (int)$listing['id']; ?>" />
                                <button class="px-3 py-1 rounded <?php echo $listing['is_featured'] ? 'bg-green-500 text-white' : 'bg-gray-200'; ?>">
                                    <?php echo $listing['is_featured'] ? 'Kaldır' : 'Öne Çıkar'; ?>
                                </button>
                            </form>
                        </td>
                        <td class="p-3 space-y-2">
                            <form method="POST" class="space-y-2">
                                <input type="hidden" name="listing_id" value="<?php echo (int)$listing['id']; ?>" />
                                <select name="status" class="border p-2 rounded w-full">
                                    <option value="pending" <?php echo $listing['status']==='pending'?'selected':''; ?>>Bekliyor</option>
                                    <option value="approved" <?php echo $listing['status']==='approved'?'selected':''; ?>>Onaylı</option>
                                    <option value="rejected" <?php echo $listing['status']==='rejected'?'selected':''; ?>>Reddedildi</option>
                                </select>
                                <select name="consultant_id" class="border p-2 rounded w-full">
                                    <option value="">Danışman ata</option>
                                    <?php foreach ($consultants as $c): ?>
                                        <option value="<?php echo $c['id']; ?>" <?php echo $listing['consultant_id']==$c['id']?'selected':''; ?>><?php echo sanitize($c['name']); ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <button name="update_status" value="1" class="bg-red-600 text-white px-3 py-2 rounded w-full">Kaydet</button>
                            </form>
                            <a href="/admin/new_listing.php?id=<?php echo (int)$listing['id']; ?>" class="text-sm text-gray-700 underline">Düzenle</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
