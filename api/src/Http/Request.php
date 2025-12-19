<?php

namespace App\Http;

class Request
{
    public string $method;
    public string $path;
    public array $query;
    public $body;
    public array $headers;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $this->path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $this->query = $_GET ?? [];
        $this->headers = getallheaders() ?: [];
        $this->body = $this->parseBody();
    }

    private function parseBody()
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            return $data ?? [];
        }
        if ($this->method === 'POST' || $this->method === 'PUT' || $this->method === 'PATCH') {
            return $_POST;
        }
        return [];
    }
}
