<?php

require_once "../src/models/User.php";
require_once "../src/helpers/Session.php";
require_once "../src/config/Database.php";

class AuthController {

    private $userModel;

    public function __construct() {
        Session::start();
      

        header("Content-Type: application/json");
         $database = new Database();
        $db = $database->connect(); 
         $this->userModel = new User($db);
    }

    /**
     * LOGIN
     * POST: username, password
     */
    public function login() {

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

       

        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Campos obligatorios"]);
            return;
        }

        $user = $this->userModel->findByUsername($email);

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Credenciales incorrectas"]);
            return;
        }

        Session::set('user_id', $user['id']);
        Session::set('email', $user['username']);

        echo json_encode([
            "success" => true,
            "message" => "Login exitoso"
            
        ]);
    }

    /**
     * REGISTER
     */
    public function register() {

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Contraseña muy corta"]);
            return;
        }

        if ($this->userModel->findByEmail($email)) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Usuario ya existe"]);
            return;
        }

        $created = $this->userModel->create($email, $password);

        if (!$created) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Error al crear usuario"]);
            return;
        }

        echo json_encode([
            "success" => true,
            "message" => "Usuario creado correctamente"
        ]);
    }

    /**
     * LOGOUT
     */
    public function logout() {

        Session::destroy();

        echo json_encode([
            "success" => true,
            "message" => "Sesión cerrada"
        ]);
    }
    public function me()
{
    Session::start();

    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "No autenticado"
        ]);
        return;
    }

    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "email" => $_SESSION['email']
        ]
    ]);
}

}