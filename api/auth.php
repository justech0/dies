<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare('SELECT id, role, name, email, phone, username, password_hash, about, avatar_path FROM users WHERE email = :email OR username = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user'] = $user;
        log_activity((int)$user['id'], $user['role'], 'login_success');
        unset($user['password_hash']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Kimlik bilgileri doğrulanamadı.']);
    }
    exit();
}

if ($method === 'POST' && $action === 'register') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!$name || !$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'Eksik alanlar mevcut.']);
        exit();
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
    $stmt->execute([$email, $email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Bu e-posta veya kullanıcı adı zaten kayıtlı.']);
        exit();
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (role, name, email, phone, username, password_hash) VALUES ("user", ?, ?, ?, ?, ?)');
    $stmt->execute([$name, $email, $phone, $email, $hash]);
    $userId = (int)$pdo->lastInsertId();

    log_activity($userId, 'user', 'register');
    $_SESSION['user_id'] = $userId;
    $user = [
        'id' => $userId,
        'role' => 'user',
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'username' => $email,
        'avatar_path' => null,
    ];
    $_SESSION['user'] = $user;

    echo json_encode(['success' => true, 'user' => $user]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Geçersiz istek.']);
?>
