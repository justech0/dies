<?php

namespace App\Controllers;

use App\Utils\Response;

class UploadController
{
    public static function handle(string $baseUrl): void
    {
        if (empty($_FILES)) {
            Response::error(400, 'Yüklenecek dosya bulunamadı.');
        }
        $files = self::normalizeFiles($_FILES);
        $urls = [];
        foreach ($files as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::error(400, 'Dosya yükleme hatası.');
            }
            if ($file['size'] > 5 * 1024 * 1024) {
                Response::error(400, 'Dosya boyutu 5MB sınırını aşıyor.');
            }
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            if ($mime !== 'image/webp') {
                Response::error(400, 'Sadece WEBP formatı kabul edilir.');
            }
            $now = new \DateTime();
            $dir = __DIR__ . '/../../uploads/' . $now->format('Y/m');
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
            $filename = pathinfo($file['name'], PATHINFO_FILENAME) ?: 'upload';
            $filename = uniqid($filename . '_', true) . '.webp';
            $dest = $dir . '/' . $filename;
            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                Response::error(500, 'Dosya kaydedilirken hata oluştu.');
            }
            $relative = 'uploads/' . $now->format('Y/m') . '/' . $filename;
            $urls[] = rtrim($baseUrl, '/') . '/' . $relative;
        }
        Response::success(['urls' => $urls]);
    }

    private static function normalizeFiles(array $files): array
    {
        $normalized = [];
        foreach ($files as $field) {
            if (is_array($field['name'])) {
                $count = count($field['name']);
                for ($i = 0; $i < $count; $i++) {
                    $normalized[] = [
                        'name' => $field['name'][$i],
                        'type' => $field['type'][$i],
                        'tmp_name' => $field['tmp_name'][$i],
                        'error' => $field['error'][$i],
                        'size' => $field['size'][$i],
                    ];
                }
            } else {
                $normalized[] = $field;
            }
        }
        return $normalized;
    }
}
