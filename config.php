<?php
// Global configuration and database connection helper
session_start();

// Default DB credentials (can be overridden by environment vars)
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'u220042353_test';
$DB_USER = getenv('DB_USER') ?: 'u220042353_test';
$DB_PASS = getenv('DB_PASS') ?: 'Dies7221.';
$DB_CHARSET = 'utf8mb4';

function enable_cors(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}

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

function log_activity(int $userId = null, string $role = null, string $action = ''): void
{
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('INSERT INTO activity_logs (user_id, role, action, ip_address) VALUES (?, ?, ?, ?)');
    $stmt->execute([$userId, $role, $action, $_SERVER['REMOTE_ADDR'] ?? null]);
}

function sanitize(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function compressImage(string $sourcePath, string $destinationPath, int $quality = 80): bool
{
    // If file is larger than 10MB, compress JPEG/PNG to the given quality
    if (!file_exists($sourcePath)) {
        return false;
    }

    $fileSizeMB = filesize($sourcePath) / (1024 * 1024);
    if ($fileSizeMB <= 10) {
        return move_uploaded_file($sourcePath, $destinationPath);
    }

    $imageInfo = getimagesize($sourcePath);
    if (!$imageInfo) {
        return false;
    }

    [$width, $height, $type] = $imageInfo;
    switch ($type) {
        case IMAGETYPE_JPEG:
            $image = imagecreatefromjpeg($sourcePath);
            $result = imagejpeg($image, $destinationPath, $quality);
            break;
        case IMAGETYPE_PNG:
            $image = imagecreatefrompng($sourcePath);
            // Convert quality (0-9) where lower is better quality for PNG
            $pngQuality = (int)round((100 - $quality) / 10);
            $result = imagepng($image, $destinationPath, $pngQuality);
            break;
        default:
            return move_uploaded_file($sourcePath, $destinationPath);
    }
    if (isset($image) && is_resource($image)) {
        imagedestroy($image);
    }
    return $result;
}
?>
