<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
$pdo = get_db_connection();
$user = current_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_POST['update_profile'])) {
        $name = $_POST['name'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $about = $_POST['about'] ?? '';
        $avatar = $_POST['avatar_path'] ?? '';
        $stmt = $pdo->prepare('UPDATE users SET name=?, phone=?, about=?, avatar_path=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([$name, $phone, $about, $avatar, $user['id']]);
        $_SESSION['user'] = array_merge($user, ['name' => $name, 'phone' => $phone, 'about' => $about, 'avatar_path' => $avatar]);
        $message = 'Profil güncellendi';
    }
    if (!empty($_POST['change_password'])) {
        $old = $_POST['old_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $hash = $stmt->fetchColumn();
        if ($hash && password_verify($old, $hash)) {
            $newHash = password_hash($new, PASSWORD_BCRYPT);
            $update = $pdo->prepare('UPDATE users SET password_hash=? WHERE id=?');
            $update->execute([$newHash, $user['id']]);
            $message = 'Şifre güncellendi';
        } else {
            $error = 'Eski şifre hatalı';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Profilim</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-3xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Profilim</h1>
        <a href="/admin/index.php" class="text-sm text-gray-600">Geri</a>
    </div>
    <?php if (!empty($message)): ?>
        <div class="bg-green-100 text-green-700 p-3 rounded"><?php echo sanitize($message); ?></div>
    <?php endif; ?>
    <?php if (!empty($error)): ?>
        <div class="bg-red-100 text-red-700 p-3 rounded"><?php echo sanitize($error); ?></div>
    <?php endif; ?>

    <div class="bg-white p-6 rounded shadow space-y-4">
        <h2 class="font-semibold">Bilgiler</h2>
        <form method="POST" class="space-y-3">
            <input type="hidden" name="update_profile" value="1" />
            <input class="border p-2 rounded w-full" name="name" value="<?php echo sanitize($user['name']); ?>" />
            <input class="border p-2 rounded w-full" name="phone" value="<?php echo sanitize($user['phone']); ?>" />
            <input class="border p-2 rounded w-full" name="avatar_path" placeholder="Avatar yolu" value="<?php echo sanitize($user['avatar_path']); ?>" />
            <textarea class="border p-2 rounded w-full" name="about" placeholder="Hakkımda"><?php echo sanitize($user['about']); ?></textarea>
            <button class="bg-red-600 text-white px-4 py-2 rounded">Kaydet</button>
        </form>
    </div>

    <div class="bg-white p-6 rounded shadow space-y-3">
        <h2 class="font-semibold">Şifre Değiştir</h2>
        <form method="POST" class="space-y-3">
            <input type="hidden" name="change_password" value="1" />
            <input class="border p-2 rounded w-full" type="password" name="old_password" placeholder="Eski Şifre" required />
            <input class="border p-2 rounded w-full" type="password" name="new_password" placeholder="Yeni Şifre" required />
            <button class="bg-gray-900 text-white px-4 py-2 rounded">Güncelle</button>
        </form>
    </div>
</div>
</body>
</html>
