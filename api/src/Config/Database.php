<?php

namespace App\Config;

use PDO;
use PDOException;
use App\Utils\Response;

class Database
{
    public static function connection(): PDO
    {
        $host = getenv('DB_HOST');
        $db   = getenv('DB_NAME');
        $user = getenv('DB_USER');
        $pass = getenv('DB_PASS');

        if (!$host || !$db || !$user) {
            Response::error(500, 'Veritabanı ortam değişkenleri eksik.', ['missing_keys' => ['DB_HOST', 'DB_NAME', 'DB_USER']]);
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
