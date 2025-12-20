<?php

namespace App\Http;

use Closure;
use App\Utils\Response;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, Closure $handler): void
    {
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        $this->routes[] = [
            'method' => strtoupper($method),
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    public function dispatch(Request $request): void
    {
        $method = strtoupper($request->method);
        $path = $request->path;

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (preg_match($route['pattern'], $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                call_user_func($route['handler'], $request, $params);
                return;
            }
        }

        Response::error(404, 'Kaynak bulunamadı.');
    }
}
