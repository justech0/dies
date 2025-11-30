<?php
require_once __DIR__ . '/../includes/auth.php';
require_consultant();
$pdo = get_db_connection();
$user = current_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $about = $_POST['about'] ?? '';
    $avatar = $_POST['avatar_path'] ?? '';
    $stmt = $pdo->prepare('UPDATE users SET name=?, phone=?, about=?, avatar_path=?, updated_at=NOW() WHERE id=?');
    $stmt->execute([$name, $phone, $about, $avatar, $user['id']]);
    $_SESSION['user'] = array_merge($user, ['name' => $name, 'phone' => $phone, 'about' => $about, 'avatar_path' => $avatar]);
    $message = 'Profil güncellendi';
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Profil</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-3xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Profil</h1>
        <a href="/consultant/index.php" class="text-sm text-gray-600">Geri</a>
    </div>
    <?php if (!empty($message)): ?>
        <div class="bg-green-100 text-green-700 p-3 rounded"><?php echo sanitize($message); ?></div>
    <?php endif; ?>
    <form method="POST" class="bg-white p-6 rounded shadow space-y-3">
        <input class="border p-2 rounded w-full" name="name" value="<?php echo sanitize($user['name']); ?>" />
        <input class="border p-2 rounded w-full" name="phone" value="<?php echo sanitize($user['phone']); ?>" />
        <input class="border p-2 rounded w-full" name="avatar_path" placeholder="Profil fotoğrafı" value="<?php echo sanitize($user['avatar_path']); ?>" />
        <textarea class="border p-2 rounded w-full" name="about" placeholder="Hakkımda"><?php echo sanitize($user['about']); ?></textarea>
        <button class="bg-red-600 text-white px-4 py-2 rounded">Kaydet</button>
    </form>
</div>
</body>
</html>
