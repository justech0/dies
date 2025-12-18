<?php

namespace App\Http;

class Response
{
    public static function success($data = null, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $data,
        ]);
        exit;
    }

    public static function error(string $message, int $code = 400, array $details = []): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
            'details' => empty($details) ? null : $details,
        ]);
        exit;
    }
}
