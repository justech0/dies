<?php

namespace App\Utils;

class Logger
{
    public static function logError(string $requestId, string $message, array $context = [], string $stack = ''): void
    {
        $file = __DIR__ . '/../../error.txt';
        $timestamp = date('c');
        $method = $_SERVER['REQUEST_METHOD'] ?? '-';
        $uri = $_SERVER['REQUEST_URI'] ?? '-';
        $userId = $context['user_id'] ?? 'guest';
        $safeMessage = self::maskSensitive($message);
        $stack = $stack ?: ($context['stack'] ?? '');
        $line = sprintf('[%s] %s %s %s user:%s %s', $timestamp, $requestId, $method, $uri, $userId, $safeMessage);
        if ($stack) {
            $line .= ' | stack: ' . self::maskSensitive($stack);
        }
        $line .= PHP_EOL;
        file_put_contents($file, $line, FILE_APPEND);
    }

    private static function maskSensitive(string $text): string
    {
        return preg_replace('/(Bearer\s+)[A-Za-z0-9\._\-]+/', '$1***', $text ?? '');
    }
}
