<?php

use App\Config\Database;
use App\Controllers\AdminController;
use App\Controllers\AdvisorController;
use App\Controllers\ApplicationController;
use App\Controllers\AuthController;
use App\Controllers\LocationController;
use App\Controllers\OfficeController;
use App\Controllers\PropertyController;
use App\Controllers\UploadController;
use App\Http\Request;
use App\Http\Router;
use App\Middleware\AuthMiddleware;
use App\Utils\Logger;
use App\Utils\Response;

$root = __DIR__;
$autoload = $root . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 500,
            'message' => 'Bağımlılıklar eksik. Lütfen api klasöründe composer install --no-dev çalıştırın.',
        ],
    ]);
    exit;
}

require $autoload;

$dotenvPath = $root . '/.env';
if (file_exists($dotenvPath)) {
    (Dotenv\Dotenv::createImmutable($root))->load();
}

$requestId = bin2hex(random_bytes(6));
define('APP_REQUEST_ID', $requestId);
header('X-Request-Id: ' . $requestId);

set_exception_handler(function ($e) use ($requestId) {
    Logger::logError($requestId, $e->getMessage(), ['stack' => $e->getTraceAsString()]);
    Response::error(500, 'Beklenmedik bir hata oluştu.');
});

set_error_handler(function ($severity, $message, $file, $line) use ($requestId) {
    Logger::logError($requestId, $message, ['stack' => $file . ':' . $line]);
    Response::error(500, 'Beklenmedik bir hata oluştu.');
});

// CORS
$allowedOrigin = getenv('FRONTEND_URL');
if ($allowedOrigin) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!is_dir($root . '/uploads')) {
    mkdir($root . '/uploads', 0775, true);
}
if (!file_exists($root . '/error.txt')) {
    touch($root . '/error.txt');
}

$request = new Request();
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$cleanPath = preg_replace('#^/api#', '', $uriPath);
$cleanPath = $cleanPath ?: '/';
$request->path = $cleanPath;

$baseUrl = rtrim(getenv('APP_URL') ?: (($_SERVER['REQUEST_SCHEME'] ?? 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '')), '/');

$pdo = Database::connection();
$currentUser = AuthMiddleware::getUser($pdo);

$router = new Router();

// Auth
$router->add('POST', '/auth/register', function ($req) use ($pdo) {
    AuthController::register($pdo, $req->body);
});
$router->add('POST', '/auth/login', function ($req) use ($pdo) {
    AuthController::login($pdo, $req->body);
});
$router->add('GET', '/auth/me', function ($req) use ($pdo, $currentUser) {
    if (!$currentUser) {
        Response::error(401, 'Oturum doğrulanamadı.');
    }
    AuthController::me($pdo, $currentUser);
});
$router->add('POST', '/auth/update-profile', function ($req) use ($pdo, $currentUser) {
    if (!$currentUser) {
        Response::error(401, 'Oturum doğrulanamadı.');
    }
    AuthController::updateProfile($pdo, $currentUser, $req->body);
});
$router->add('POST', '/auth/forgot-password', function ($req) use ($pdo) {
    AuthController::forgotPassword($pdo, $req->body);
});
$router->add('POST', '/auth/reset-password', function ($req) use ($pdo) {
    AuthController::resetPassword($pdo, $req->body);
});

// Locations
$router->add('GET', '/locations/cities', function () use ($pdo) {
    header('Cache-Control: public, max-age=86400');
    LocationController::cities($pdo);
});
$router->add('GET', '/locations/districts', function ($req) use ($pdo) {
    $cityId = (int)($req->query['city_id'] ?? 0);
    LocationController::districts($pdo, $cityId);
});
$router->add('GET', '/locations/towns', function ($req) use ($pdo) {
    $districtId = (int)($req->query['district_id'] ?? 0);
    LocationController::towns($pdo, $districtId);
});
$router->add('GET', '/locations/neighborhoods', function ($req) use ($pdo) {
    $districtId = (int)($req->query['district_id'] ?? 0);
    $townId = isset($req->query['town_id']) ? (int)$req->query['town_id'] : null;
    LocationController::neighborhoods($pdo, $districtId, $townId);
});

// Properties
$router->add('GET', '/properties', function ($req) use ($pdo, $currentUser, $baseUrl) {
    PropertyController::list($pdo, $currentUser, $req->query, $baseUrl);
});
$router->add('GET', '/properties/{id}', function ($req, $params) use ($pdo, $currentUser, $baseUrl) {
    PropertyController::detail($pdo, $currentUser, (int)$params['id'], $baseUrl);
});
$router->add('POST', '/properties', function ($req) use ($pdo, $currentUser, $baseUrl) {
    if (!$currentUser) Response::error(401, 'Oturum doğrulanamadı.');
    PropertyController::create($pdo, $currentUser, $req->body, $baseUrl);
});
$router->add('POST', '/properties/{id}', function ($req, $params) use ($pdo, $currentUser, $baseUrl) {
    if (!$currentUser) Response::error(401, 'Oturum doğrulanamadı.');
    PropertyController::update($pdo, $currentUser, (int)$params['id'], $req->body, $baseUrl);
});
$router->add('DELETE', '/properties/{id}', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser) Response::error(401, 'Oturum doğrulanamadı.');
    PropertyController::delete($pdo, $currentUser, (int)$params['id']);
});

// Upload
$router->add('POST', '/upload', function () use ($currentUser, $baseUrl) {
    if (!$currentUser) Response::error(401, 'Oturum doğrulanamadı.');
    UploadController::handle($baseUrl);
});

// Advisors
$router->add('GET', '/advisors', function () use ($pdo, $baseUrl) {
    AdvisorController::list($pdo, $baseUrl);
});
$router->add('GET', '/advisors/{id}', function ($req, $params) use ($pdo, $baseUrl) {
    AdvisorController::detail($pdo, $baseUrl, (int)$params['id']);
});

// Offices
$router->add('GET', '/offices', function () use ($pdo, $baseUrl) {
    OfficeController::list($pdo, $baseUrl);
});
$router->add('POST', '/offices', function ($req) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    OfficeController::create($pdo, $req->body);
});
$router->add('POST', '/offices/{id}', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    OfficeController::update($pdo, (int)$params['id'], $req->body);
});
$router->add('DELETE', '/offices/{id}', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    OfficeController::delete($pdo, (int)$params['id']);
});

// Applications
$router->add('POST', '/applications/advisor', function ($req) use ($pdo) {
    ApplicationController::submit($pdo, 'advisor', $req->body);
});
$router->add('POST', '/applications/office', function ($req) use ($pdo) {
    ApplicationController::submit($pdo, 'office', $req->body);
});

// Admin
$router->add('GET', '/admin/stats', function () use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::stats($pdo);
});
$router->add('GET', '/admin/advisors', function () use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::advisors($pdo);
});
$router->add('POST', '/admin/advisors/{id}', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::updateAdvisor($pdo, (int)$params['id'], $req->body);
});
$router->add('GET', '/admin/properties/pending', function () use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::pendingProperties($pdo);
});
$router->add('POST', '/admin/properties/{id}/approve', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::approveProperty($pdo, (int)$params['id'], (int)$currentUser['id']);
});
$router->add('POST', '/admin/properties/{id}/reject', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::rejectProperty($pdo, (int)$params['id'], $req->body['reason'] ?? null);
});
$router->add('GET', '/admin/users', function () use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::listUsers($pdo);
});
$router->add('POST', '/admin/users/{id}/role', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::changeRole($pdo, (int)$params['id'], $req->body['role'] ?? '');
});
$router->add('POST', '/admin/users/{id}/reset-password', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::resetPassword($pdo, (int)$params['id']);
});
$router->add('GET', '/admin/applications', function ($req) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    $type = $req->query['type'] ?? null;
    AdminController::applications($pdo, $type);
});
$router->add('POST', '/admin/applications/{id}', function ($req, $params) use ($pdo, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') Response::error(403, 'Bu işlem için yetkiniz yok.');
    AdminController::updateApplication($pdo, (int)$params['id'], $req->body['status'] ?? '');
});

$router->dispatch($request);
