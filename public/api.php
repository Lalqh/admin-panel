<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

// Autoload
spl_autoload_register(function ($class) {

    $paths = [
        "../src/controllers/",
        "../src/models/",
        "../src/helpers/"
    ];

    foreach ($paths as $path) {
        $file = $path . $class . ".php";
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Iniciar sesión
Session::start();

try {

    $controller = $_GET['controller'] ?? null;
    $action     = $_GET['action'] ?? null;

   if (!$controller || !$action) {
   
    return;
}


    $controllerName = ucfirst($controller) . "Controller";

    if (!class_exists($controllerName)) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Controller no encontrado"]);
        exit;
    }

    $controllerObject = new $controllerName();

    if (!method_exists($controllerObject, $action)) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Acción no encontrada"]);
        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Middleware global
    |--------------------------------------------------------------------------
    */

    $publicRoutes = [
        "auth@login",
        "auth@me",
        "auth@logout",
        "auth@register", 
    ];

    $currentRoute = strtolower($controller . "@" . $action);

    if (!in_array($currentRoute, $publicRoutes)) {

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "No autenticado"
            ]);
            exit;
        }
    }

    $controllerObject->$action();

} catch (Throwable $e) {

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno del servidor",
        "error" => $e->getMessage()
    ]);

    error_log($e->getMessage());
}
