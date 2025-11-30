<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
$pdo = get_db_connection();
$logs = $pdo->query('SELECT a.*, u.name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 200')->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Aktivite Logları</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
    <div class="max-w-5xl mx-auto p-6">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Aktivite Logları</h1>
            <a href="/admin/index.php" class="text-sm text-gray-600">Geri</a>
        </div>
        <div class="bg-white rounded shadow overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left">Kullanıcı</th>
                        <th class="p-2 text-left">Rol</th>
                        <th class="p-2 text-left">Aksiyon</th>
                        <th class="p-2 text-left">IP</th>
                        <th class="p-2 text-left">Tarih</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($logs as $log): ?>
                    <tr class="border-b">
                        <td class="p-2"><?php echo sanitize($log['name'] ?? 'Sistem'); ?></td>
                        <td class="p-2"><?php echo sanitize($log['role']); ?></td>
                        <td class="p-2"><?php echo sanitize($log['action']); ?></td>
                        <td class="p-2"><?php echo sanitize($log['ip_address']); ?></td>
                        <td class="p-2"><?php echo sanitize($log['created_at']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
