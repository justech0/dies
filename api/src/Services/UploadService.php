<?php

namespace App\Services;

use App\Http\Response;

class UploadService
{
    private array $allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    private int $maxSize = 5 * 1024 * 1024;

    public function handle(array $files): array
    {
        if (!isset($files['files'])) {
            Response::error('Dosya bulunamadı', 400);
        }

        $uploads = $files['files'];
        if (!is_array($uploads['name'])) {
            foreach ($uploads as $key => $value) {
                $uploads[$key] = [$value];
            }
        }

        $urls = [];
        $baseUrl = rtrim($_ENV['APP_URL'] ?? '', '/');

        foreach ($uploads['name'] as $index => $name) {
            $tmpName = $uploads['tmp_name'][$index];
            $size = $uploads['size'][$index];
            $error = $uploads['error'][$index];

            if ($error !== UPLOAD_ERR_OK) {
                continue;
            }

            if ($size > $this->maxSize) {
                Response::error('Dosya boyutu 5MB sınırını aşıyor', 400);
            }

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $tmpName);
            finfo_close($finfo);

            if (!in_array($mime, $this->allowedMime, true)) {
                Response::error('Geçersiz dosya türü', 400);
            }

            $extension = $this->getExtension($mime);
            $folder = date('Y/m');
            $targetDir = __DIR__ . '/../../uploads/' . $folder;
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0775, true);
            }

            $filename = bin2hex(random_bytes(12)) . '.' . $extension;
            $targetPath = $targetDir . '/' . $filename;

            if (!move_uploaded_file($tmpName, $targetPath)) {
                Response::error('Dosya yüklenemedi', 500);
            }

            $publicPath = '/api/uploads/' . $folder . '/' . $filename;
            $urls[] = $baseUrl ? $baseUrl . $publicPath : $publicPath;
        }

        return $urls;
    }

    private function getExtension(string $mime): string
    {
        return match ($mime) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpg',
        };
    }
}
