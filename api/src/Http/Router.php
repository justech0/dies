<?php

namespace App\Http;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, callable $handler, array $options = []): void
    {
        $this->routes[strtoupper($method)][] = [
            'path' => $path,
            'handler' => $handler,
            'options' => $options,
            'pattern' => $this->convertPathToRegex($path),
        ];
    }

    public function dispatch(string $method, string $uri, array $request): void
    {
        $method = strtoupper($method);
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';

        if (!isset($this->routes[$method])) {
            Response::error('Endpoint bulunamadı.', 404);
        }

        foreach ($this->routes[$method] as $route) {
            if (preg_match($route['pattern'], $path, $matches)) {
                array_shift($matches);
                $params = $this->extractParams($route['path'], $matches);
                $request['params'] = $params;
                $handler = $route['handler'];
                $handler($request);
                return;
            }
        }

        Response::error('Endpoint bulunamadı.', 404);
    }

    private function convertPathToRegex(string $path): string
    {
        $regex = preg_replace('#:([a-zA-Z0-9_]+)#', '([^/]+)', $path);
        return '#^' . $regex . '$#';
    }

    private function extractParams(string $path, array $matches): array
    {
        $params = [];
        if (preg_match_all('#:([a-zA-Z0-9_]+)#', $path, $keys)) {
            foreach ($keys[1] as $index => $key) {
                $params[$key] = $matches[$index] ?? null;
            }
        }
        return $params;
    }
}
