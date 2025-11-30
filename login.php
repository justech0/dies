<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pdo = get_db_connection();
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :username OR username = :username LIMIT 1');
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user'] = $user;
        log_activity((int)$user['id'], $user['role'], 'login_success');

        if ($user['role'] === 'admin') {
            header('Location: /admin/index.php');
        } elseif ($user['role'] === 'advisor') {
            header('Location: /consultant/index.php');
        } else {
            header('Location: /user/index.php');
        }
        exit();
    }
    $error = 'Kullanıcı adı veya şifre hatalı.';
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>DİES | Giriş</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6">Giriş Yap</h1>
        <?php if (!empty($error)): ?>
            <div class="bg-red-100 text-red-700 p-3 rounded mb-4"><?php echo sanitize($error); ?></div>
        <?php endif; ?>
        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">E-posta veya Kullanıcı Adı</label>
                <input type="text" name="username" required class="w-full border rounded p-3" />
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Şifre</label>
                <input type="password" name="password" required class="w-full border rounded p-3" />
            </div>
            <button type="submit" class="w-full bg-red-600 text-white py-3 rounded font-bold">Giriş Yap</button>
        </form>
    </div>
</body>
</html>
