<?php

namespace App\Config;

use PDO;
use PDOException;
use App\Utils\Response;

class Database
{
    public static function connection(): PDO
    {
        $fetch = function (string $key) {
            if (isset($_ENV[$key])) return $_ENV[$key];
            if (isset($_SERVER[$key])) return $_SERVER[$key];
            return getenv($key);
        };

        $host = $fetch('DB_HOST');
        $db   = $fetch('DB_NAME');
        $user = $fetch('DB_USER');
        $pass = $fetch('DB_PASS');

        $missing = [];
        foreach (['DB_HOST' => $host, 'DB_NAME' => $db, 'DB_USER' => $user] as $key => $value) {
            if (!$value) {
                $missing[] = $key;
            }
        }
        if ($missing) {
            Response::error(500, 'Veritabanı ortam değişkenleri eksik.', ['missing_keys' => $missing]);
        }

        try {
            $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            return new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            Response::error(500, 'Veritabanı bağlantısı kurulamadı.', ['message' => $e->getMessage()]);
        }
    }
}
