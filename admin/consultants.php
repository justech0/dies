<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
$pdo = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'promote') {
        $userId = (int)$_POST['user_id'];
        $stmt = $pdo->prepare('UPDATE users SET role = "consultant" WHERE id = ?');
        $stmt->execute([$userId]);
        log_activity(current_user()['id'], 'admin', 'promote_consultant');
    }
    if ($action === 'create') {
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $password = $_POST['password'] ?? '';
        $stmt = $pdo->prepare('INSERT INTO users (role, name, email, phone, username, password_hash, created_at, updated_at) VALUES ("consultant", ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$name, $email, $phone, $email, password_hash($password, PASSWORD_BCRYPT)]);
        log_activity(current_user()['id'], 'admin', 'consultant_created');
    }
    header('Location: consultants.php');
    exit();
}

$consultants = $pdo->query("SELECT * FROM users WHERE role = 'consultant' ORDER BY created_at DESC")->fetchAll();
$users = $pdo->query("SELECT id, name, email FROM users WHERE role = 'user'")->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Danışman Yönetimi</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-5xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Danışmanlar</h1>
        <a href="/admin/index.php" class="text-sm text-gray-600">Geri</a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-5 rounded shadow">
            <h2 class="font-semibold mb-3">Yeni Danışman Oluştur</h2>
            <form method="POST" class="space-y-3">
                <input type="hidden" name="action" value="create" />
                <input class="border p-2 rounded w-full" name="name" placeholder="Ad Soyad" required />
                <input class="border p-2 rounded w-full" name="email" placeholder="E-posta" required />
                <input class="border p-2 rounded w-full" name="phone" placeholder="Telefon" />
                <input class="border p-2 rounded w-full" type="password" name="password" placeholder="Geçici Şifre" required />
                <button class="bg-red-600 text-white px-4 py-2 rounded">Ekle</button>
            </form>
        </div>
        <div class="bg-white p-5 rounded shadow">
            <h2 class="font-semibold mb-3">Mevcut Kullanıcıyı Yükselt</h2>
            <form method="POST" class="space-y-3">
                <input type="hidden" name="action" value="promote" />
                <select name="user_id" class="border p-2 rounded w-full">
                    <?php foreach ($users as $u): ?>
                        <option value="<?php echo $u['id']; ?>"><?php echo sanitize($u['name'] . ' (' . $u['email'] . ')'); ?></option>
                    <?php endforeach; ?>
                </select>
                <button class="bg-gray-900 text-white px-4 py-2 rounded">Danışman Yap</button>
            </form>
        </div>
    </div>

    <div class="bg-white p-6 rounded shadow">
        <h3 class="font-semibold mb-4">Danışman Listesi</h3>
        <table class="min-w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-2 text-left">Ad Soyad</th>
                    <th class="p-2 text-left">E-posta</th>
                    <th class="p-2 text-left">Telefon</th>
                    <th class="p-2 text-left">İlan Sayısı</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($consultants as $c): ?>
                    <?php
                        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM listings WHERE consultant_id = ?');
                        $countStmt->execute([$c['id']]);
                        $listingCount = $countStmt->fetchColumn();
                    ?>
                    <tr class="border-b">
                        <td class="p-2"><?php echo sanitize($c['name']); ?></td>
                        <td class="p-2"><?php echo sanitize($c['email']); ?></td>
                        <td class="p-2"><?php echo sanitize($c['phone']); ?></td>
                        <td class="p-2"><?php echo (int)$listingCount; ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
