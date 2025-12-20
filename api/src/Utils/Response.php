<?php

namespace App\Utils;

use App\Utils\Logger;

class Response
{
    public static function success($data = null, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(int $code, string $message, $details = null): void
    {
        $requestId = defined('APP_REQUEST_ID') ? APP_REQUEST_ID : null;
        if ($requestId) {
            Logger::logError($requestId, $message, ['stack' => json_encode($details)]);
        }
        http_response_code($code);
        header('Content-Type: application/json');
        $payload = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ];
        if ($details !== null) {
            $payload['details'] = $details;
        }
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
