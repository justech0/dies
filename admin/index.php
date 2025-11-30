<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
$pdo = get_db_connection();

$stats = [
    'listings' => (int)$pdo->query('SELECT COUNT(*) FROM listings')->fetchColumn(),
    'pending' => (int)$pdo->query("SELECT COUNT(*) FROM listings WHERE status = 'pending'")->fetchColumn(),
    'consultants' => (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'consultant'")->fetchColumn(),
    'offices' => (int)$pdo->query('SELECT COUNT(*) FROM offices')->fetchColumn(),
];
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Admin Paneli</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-100">
    <div class="flex min-h-screen">
        <aside class="w-64 bg-black text-white p-6 space-y-4">
            <h1 class="text-2xl font-bold mb-6">DİES Admin</h1>
            <nav class="space-y-2">
                <a href="/admin/index.php" class="block py-2 px-3 rounded bg-gray-800">Dashboard</a>
                <a href="/admin/listings.php" class="block py-2 px-3 rounded hover:bg-gray-800">İlanlar</a>
                <a href="/admin/consultants.php" class="block py-2 px-3 rounded hover:bg-gray-800">Danışmanlar</a>
                <a href="/admin/offices.php" class="block py-2 px-3 rounded hover:bg-gray-800">Ofisler</a>
                <a href="/admin/logs.php" class="block py-2 px-3 rounded hover:bg-gray-800">Loglar</a>
                <a href="/admin/profile.php" class="block py-2 px-3 rounded hover:bg-gray-800">Profilim</a>
                <a href="/logout.php" class="block py-2 px-3 rounded hover:bg-gray-800">Çıkış</a>
            </nav>
        </aside>
        <main class="flex-1 p-8 space-y-6">
            <h2 class="text-3xl font-bold">Genel Bakış</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white p-4 rounded shadow">
                    <p class="text-sm text-gray-500">Toplam İlan</p>
                    <p class="text-2xl font-bold text-red-600"><?php echo $stats['listings']; ?></p>
                </div>
                <div class="bg-white p-4 rounded shadow">
                    <p class="text-sm text-gray-500">Bekleyen</p>
                    <p class="text-2xl font-bold"><?php echo $stats['pending']; ?></p>
                </div>
                <div class="bg-white p-4 rounded shadow">
                    <p class="text-sm text-gray-500">Danışman</p>
                    <p class="text-2xl font-bold"><?php echo $stats['consultants']; ?></p>
                </div>
                <div class="bg-white p-4 rounded shadow">
                    <p class="text-sm text-gray-500">Ofis</p>
                    <p class="text-2xl font-bold"><?php echo $stats['offices']; ?></p>
                </div>
            </div>
            <div class="bg-white p-6 rounded shadow">
                <h3 class="text-xl font-bold mb-4">Hızlı Aksiyonlar</h3>
                <div class="space-x-3">
                    <a href="/admin/listings.php" class="bg-red-600 text-white px-4 py-2 rounded">İlan Yönet</a>
                    <a href="/admin/consultants.php" class="bg-gray-900 text-white px-4 py-2 rounded">Danışmanlar</a>
                    <a href="/admin/offices.php" class="bg-gray-700 text-white px-4 py-2 rounded">Ofisler</a>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
