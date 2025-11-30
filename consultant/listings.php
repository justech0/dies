<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_consultant();

$user = current_user();
$pdo = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $type = $_POST['type'] ?? '';
    $price = (float)($_POST['price'] ?? 0);
    $id = $_POST['id'] ?? '';

    if ($id) {
        $stmt = $pdo->prepare('UPDATE listings SET title=?, description=?, type=?, price=?, updated_at=NOW() WHERE id=? AND consultant_id=?');
        $stmt->execute([$title, $description, $type, $price, $id, $user['id']]);
        log_activity($user['id'], 'consultant', 'listing_updated');
    } else {
        $stmt = $pdo->prepare('INSERT INTO listings (title, description, type, price, status, owner_user_id, consultant_id, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, "approved", ?, ?, 0, NOW(), NOW())');
        $stmt->execute([$title, $description, $type, $price, $user['id'], $user['id']]);
        log_activity($user['id'], 'consultant', 'listing_created');
    }
    header('Location: listings.php');
    exit();
}

$listings = fetch_listings(['consultant_id' => $user['id']]);
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>İlanlarım</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-5xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">İlanlarım</h1>
        <a href="/consultant/index.php" class="text-sm text-gray-600">Geri</a>
    </div>

    <div class="bg-white p-6 rounded shadow space-y-3">
        <h2 class="font-semibold">Yeni İlan</h2>
        <form method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input class="border p-2 rounded" name="title" placeholder="Başlık" required />
            <input class="border p-2 rounded" name="price" type="number" placeholder="Fiyat" required />
            <select name="type" class="border p-2 rounded">
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
            </select>
            <textarea class="border p-2 rounded md:col-span-2" name="description" placeholder="Açıklama" required></textarea>
            <button class="bg-red-600 text-white px-4 py-2 rounded md:col-span-2">Kaydet</button>
        </form>
    </div>

    <div class="bg-white p-6 rounded shadow">
        <h3 class="font-semibold mb-3">Kayıtlı İlanlar</h3>
        <table class="min-w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-2 text-left">Başlık</th>
                    <th class="p-2 text-left">Durum</th>
                    <th class="p-2 text-left">Fiyat</th>
                    <th class="p-2 text-left">Aksiyon</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($listings as $listing): ?>
                    <tr class="border-b">
                        <td class="p-2"><?php echo sanitize($listing['title']); ?></td>
                        <td class="p-2 capitalize"><?php echo sanitize($listing['status']); ?></td>
                        <td class="p-2"><?php echo number_format((float)$listing['price'], 0, ',', '.'); ?> TL</td>
                        <td class="p-2">
                            <form method="POST" class="space-y-2">
                                <input type="hidden" name="id" value="<?php echo $listing['id']; ?>" />
                                <input class="border p-2 rounded w-full" name="title" value="<?php echo sanitize($listing['title']); ?>" />
                                <input class="border p-2 rounded w-full" name="price" type="number" value="<?php echo sanitize($listing['price']); ?>" />
                                <textarea class="border p-2 rounded w-full" name="description"><?php echo sanitize($listing['description']); ?></textarea>
                                <button class="bg-gray-900 text-white px-3 py-2 rounded w-full">Güncelle</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
