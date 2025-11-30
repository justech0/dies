<?php
require_once __DIR__ . '/../includes/auth.php';
require_consultant();
$pdo = get_db_connection();
$user = current_user();

$total = $pdo->prepare('SELECT COUNT(*) FROM listings WHERE consultant_id = ?');
$total->execute([$user['id']]);
$approved = $pdo->prepare("SELECT COUNT(*) FROM listings WHERE consultant_id = ? AND status = 'approved'");
$approved->execute([$user['id']]);
$pending = $pdo->prepare("SELECT COUNT(*) FROM listings WHERE consultant_id = ? AND status = 'pending'");
$pending->execute([$user['id']]);
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Danışman Paneli</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Merhaba, <?php echo sanitize($user['name']); ?></h1>
        <a href="/logout.php" class="text-sm text-gray-600">Çıkış</a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded shadow"><p class="text-sm text-gray-500">Toplam</p><p class="text-2xl font-bold text-red-600"><?php echo (int)$total->fetchColumn(); ?></p></div>
        <div class="bg-white p-4 rounded shadow"><p class="text-sm text-gray-500">Yayında</p><p class="text-2xl font-bold"><?php echo (int)$approved->fetchColumn(); ?></p></div>
        <div class="bg-white p-4 rounded shadow"><p class="text-sm text-gray-500">Bekleyen</p><p class="text-2xl font-bold"><?php echo (int)$pending->fetchColumn(); ?></p></div>
    </div>

    <div class="bg-white p-6 rounded shadow space-y-3">
        <h2 class="font-semibold">Hızlı Erişim</h2>
        <div class="space-x-3">
            <a href="/consultant/listings.php" class="bg-red-600 text-white px-4 py-2 rounded">İlanlarım</a>
            <a href="/consultant/profile.php" class="bg-gray-900 text-white px-4 py-2 rounded">Profil</a>
        </div>
    </div>
</div>
</body>
</html>
