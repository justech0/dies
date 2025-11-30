<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');
enable_cors();

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

function buildUserPayload(array $user): array
{
    unset($user['password']);
    if (!empty($user['social_links'])) {
        $user['social_links'] = json_decode($user['social_links'], true);
    }
    return $user;
}

if ($method === 'POST' && $action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email OR phone = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user'] = buildUserPayload($user);
        log_activity((int)$user['id'], $user['role'], 'login_success');
        echo json_encode(['success' => true, 'user' => buildUserPayload($user)]);
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

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR phone = ?');
    $stmt->execute([$email, $phone]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Bu e-posta veya telefon zaten kayıtlı.']);
        exit();
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, "user")');
    $stmt->execute([$name, $email, $phone, $hash]);
    $userId = (int)$pdo->lastInsertId();

    $user = [
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'role' => 'user',
        'image' => null,
        'social_links' => null,
    ];
    $_SESSION['user_id'] = $userId;
    $_SESSION['user'] = $user;
    log_activity($userId, 'user', 'register');

    echo json_encode(['success' => true, 'user' => $user]);
    exit();
}

if ($method === 'POST' && $action === 'update_profile') {
    $userId = (int)($_POST['user_id'] ?? 0);
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı.']);
        exit();
    }
    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $socialLinks = [
        'instagram' => trim($_POST['instagram'] ?? ''),
        'facebook' => trim($_POST['facebook'] ?? ''),
    ];

    $imagePath = null;
    if (!empty($_FILES['image']['tmp_name']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
        $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9\.\-_]/', '_', $_FILES['image']['name']);
        $targetDir = __DIR__ . '/../uploads/profiles/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        $target = $targetDir . $safeName;
        if (compressImage($_FILES['image']['tmp_name'], $target)) {
            $imagePath = '/uploads/profiles/' . $safeName;
        }
    }

    $sql = 'UPDATE users SET name = :name, phone = :phone, social_links = :social_links';
    $params = [
        'name' => $name,
        'phone' => $phone,
        'social_links' => json_encode($socialLinks),
        'id' => $userId,
    ];
    if ($imagePath) {
        $sql .= ', image = :image';
        $params['image'] = $imagePath;
    }
    $sql .= ' WHERE id = :id';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $updated = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $updated->execute([$userId]);
    $user = buildUserPayload($updated->fetch());
    $_SESSION['user'] = $user;

    echo json_encode(['success' => true, 'user' => $user]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Geçersiz istek.']);
?>
