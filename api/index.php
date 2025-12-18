<?php

use App\Config\Database;
use App\Controllers\AdminController;
use App\Controllers\AdvisorController;
use App\Controllers\ApplicationController;
use App\Controllers\AuthController;
use App\Controllers\LocationController;
use App\Controllers\OfficeController;
use App\Controllers\PropertyController;
use App\Http\Response;
use App\Http\Router;
use App\Middleware\Auth;
use App\Services\UploadService;
use Dotenv\Dotenv;

require __DIR__ . '/vendor/autoload.php';

if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

date_default_timezone_set('Europe/Istanbul');

$allowedOrigin = $_ENV['FRONTEND_URL'] ?? '*';
header('Access-Control-Allow-Origin: ' . ($allowedOrigin ?: '*'));
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$body = [];
if (str_contains($contentType, 'application/json') && $rawInput) {
    $decoded = json_decode($rawInput, true);
    $body = is_array($decoded) ? $decoded : [];
} else {
    $body = $_POST ?? [];
}

$request = [
    'body' => $body,
    'query' => $_GET ?? [],
    'files' => $_FILES ?? [],
];

try {
    $db = (new Database())->getConnection();

    $router = new Router();
    $auth = new Auth($db);

    $authController = new AuthController($db);
    $propertyController = new PropertyController($db);
    $adminController = new AdminController($db);
    $locationController = new LocationController($db);
    $advisorController = new AdvisorController($db);
    $officeController = new OfficeController($db);
    $applicationController = new ApplicationController($db);
    $uploadService = new UploadService();

    // Auth
    $router->add('POST', '/auth/login', fn($req) => $authController->login($req));
    $router->add('POST', '/auth/register', fn($req) => $authController->register($req));
    $router->add('GET', '/auth/me', function ($req) use ($auth, $authController) {
        $req = $auth->requireUser($req);
        $authController->me($req);
    });
    $router->add('POST', '/auth/update-profile', function ($req) use ($auth, $authController) {
        $req = $auth->requireUser($req);
        $authController->updateProfile($req);
    });
    $router->add('POST', '/auth/forgot-password', fn($req) => $authController->forgotPassword($req));
    $router->add('POST', '/auth/reset-password', fn($req) => $authController->resetPassword($req));

    // Locations
    $router->add('GET', '/locations/cities', fn($req) => $locationController->cities($req));
    $router->add('GET', '/locations/districts', fn($req) => $locationController->districts($req));
    $router->add('GET', '/locations/neighborhoods', fn($req) => $locationController->neighborhoods($req));

    // Properties
    $router->add('GET', '/properties', function ($req) use ($auth, $propertyController) {
        $req = $auth->optionalUser($req);
        $propertyController->list($req);
    });
    $router->add('GET', '/properties/:id', function ($req) use ($auth, $propertyController) {
        $req = $auth->optionalUser($req);
        $propertyController->detail($req);
    });
    $router->add('POST', '/properties', function ($req) use ($auth, $propertyController) {
        $req = $auth->requireUser($req);
        $propertyController->create($req);
    });
    $router->add('POST', '/properties/:id', function ($req) use ($auth, $propertyController) {
        $req = $auth->requireUser($req);
        $propertyController->update($req);
    });
    $router->add('DELETE', '/properties/:id', function ($req) use ($auth, $propertyController) {
        $req = $auth->requireUser($req);
        $propertyController->delete($req);
    });

    // Uploads
    $router->add('POST', '/upload', function ($req) use ($auth, $uploadService) {
        $req = $auth->requireUser($req);
        $urls = $uploadService->handle($_FILES ?? []);
        Response::success(['urls' => $urls]);
    });

    // Admin
    $router->add('GET', '/admin/stats', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->stats($req);
    });
    $router->add('GET', '/admin/properties/pending', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->pendingProperties($req);
    });
    $router->add('POST', '/admin/properties/:id/approve', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->approveProperty($req);
    });
    $router->add('POST', '/admin/properties/:id/reject', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->rejectProperty($req);
    });
    $router->add('GET', '/admin/users', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->users();
    });
    $router->add('POST', '/admin/users/:id/role', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->updateUserRole($req);
    });
    $router->add('POST', '/admin/users/:id/reset-password', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->resetPassword($req);
    });
    $router->add('GET', '/admin/applications', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->applications($req);
    });
    $router->add('POST', '/admin/applications/:id', function ($req) use ($auth, $adminController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $adminController->manageApplication($req);
    });

    // Advisors
    $router->add('GET', '/advisors', fn($req) => $advisorController->list($req));
    $router->add('GET', '/advisors/:id', fn($req) => $advisorController->detail($req));

    // Offices
    $router->add('GET', '/offices', fn($req) => $officeController->list($req));
    $router->add('POST', '/offices', function ($req) use ($auth, $officeController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $officeController->create($req);
    });
    $router->add('POST', '/offices/:id', function ($req) use ($auth, $officeController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $officeController->update($req);
    });
    $router->add('DELETE', '/offices/:id', function ($req) use ($auth, $officeController) {
        $req = $auth->requireUser($req, ['roles' => ['admin']]);
        $officeController->delete($req);
    });

    // Applications
    $router->add('POST', '/applications/advisor', fn($req) => $applicationController->advisor($req));
    $router->add('POST', '/applications/office', fn($req) => $applicationController->office($req));

    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI'], $request);
} catch (Throwable $e) {
    Response::error('Sunucu hatası', 500, ['message' => $e->getMessage()]);
}
