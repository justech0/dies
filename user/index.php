<?php
require_once __DIR__ . '/../includes/auth.php';
require_user();
require_once __DIR__ . '/../includes/functions.php';
$user = current_user();
$listings = fetch_listings(['owner_user_id' => $user['id']]);
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Profilim</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-5xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-2xl font-bold"><?php echo sanitize($user['name']); ?></h1>
            <p class="text-gray-600"><?php echo sanitize($user['email']); ?></p>
        </div>
        <div class="space-x-2">
            <a href="/user/create_listing.php" class="bg-red-600 text-white px-4 py-2 rounded">İlan Ver</a>
            <a href="/logout.php" class="text-sm text-gray-600">Çıkış</a>
        </div>
    </div>

    <div class="bg-white p-6 rounded shadow">
        <h2 class="font-semibold mb-3">İlanlarım</h2>
        <table class="min-w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-2 text-left">Başlık</th>
                    <th class="p-2 text-left">Durum</th>
                    <th class="p-2 text-left">Fiyat</th>
                    <th class="p-2 text-left">Kayıt</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($listings as $listing): ?>
                    <tr class="border-b">
                        <td class="p-2"><?php echo sanitize($listing['title']); ?></td>
                        <td class="p-2 capitalize"><?php echo sanitize($listing['status']); ?></td>
                        <td class="p-2"><?php echo number_format((float)$listing['price'], 0, ',', '.'); ?> TL</td>
                        <td class="p-2"><?php echo sanitize($listing['created_at']); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
