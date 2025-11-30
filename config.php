<?php
// Global configuration and database connection helper
session_start();

$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'dies_db';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';
$DB_CHARSET = 'utf8mb4';

function get_db_connection(): PDO
{
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_CHARSET;

    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    return $pdo;
}

function log_activity(int $userId, string $role, string $action): void
{
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('INSERT INTO activity_logs (user_id, role, action, ip_address) VALUES (?, ?, ?, ?)');
    $stmt->execute([$userId, $role, $action, $_SERVER['REMOTE_ADDR'] ?? null]);
}

function sanitize(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
