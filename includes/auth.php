<?php
require_once __DIR__ . '/../config.php';

function current_user(): ?array
{
    if (!empty($_SESSION['user'])) {
        return $_SESSION['user'];
    }

    if (!empty($_SESSION['user_id'])) {
        $pdo = get_db_connection();
        $stmt = $pdo->prepare('SELECT id, role, name, email, phone, username, about, avatar_path FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if ($user) {
            $_SESSION['user'] = $user;
            return $user;
        }
    }
    return null;
}

function require_login(): void
{
    if (!current_user()) {
        header('Location: /login.php');
        exit();
    }
}

function require_role(string $role): void
{
    $user = current_user();
    if (!$user || $user['role'] !== $role) {
        header('HTTP/1.1 403 Forbidden');
        echo 'Bu sayfaya erişim yetkiniz yok.';
        exit();
    }
}

function require_admin(): void
{
    require_role('admin');
}

function require_consultant(): void
{
    require_role('advisor');
}

function require_advisor(): void
{
    require_role('advisor');
}

function require_user(): void
{
    require_role('user');
}
?>
