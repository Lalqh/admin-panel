<?php

$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

if ($path !== '/' && is_dir($file)) {
    return false;
}

// Todo lo demás carga index.html (SPA)
require_once __DIR__ . '/index.html';
