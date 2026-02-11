<?php

require_once "../src/models/Client.php";
require_once "../src/helpers/Session.php";
require_once "../src/config/Database.php";

class ClientController {

    private $clientModel;

    public function __construct() {
        Session::start();

        header("Content-Type: application/json");

        if (!Session::get('user_id')) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "No autorizado"
            ]);
            exit;
        }

        $database = new Database();
        $db = $database->connect();
        $this->clientModel = new Cliente($db);
    }

    public function index() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $search = $_GET['search'] ?? "";

        if ($page < 1) $page = 1;
        if ($limit < 1) $limit = 10;

        $offset = ($page - 1) * $limit;

        try {
            $clientes = $this->clientModel->getPaginated($limit, $offset, $search);
            $total = $this->clientModel->count($search);

            echo json_encode([
                "success" => true,
                "data" => $clientes,
                "pagination" => [
                    "page" => $page,
                    "limit" => $limit,
                    "total" => $total,
                    "total_pages" => (int)ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al obtener clientes"
            ]);
        }
    }

    public function store() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $required = ['nombres', 'apellido_paterno', 'domicilio', 'email'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Campo obligatorio: $field"
                ]);
                return;
            }
        }

        try {
            $created = $this->clientModel->create($data);

            if (!$created) {
                throw new Exception();
            }

            echo json_encode([
                "success" => true,
                "message" => "Cliente creado correctamente"
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al crear cliente"
            ]);
        }
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $required = ['nombres', 'apellido_paterno', 'domicilio', 'email'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Campo obligatorio: $field"
                ]);
                return;
            }
        }

        $id = $data['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID requerido"]);
            return;
        }

        try {
            $updated = $this->clientModel->update($id, $data);

            if (!$updated) {
                throw new Exception();
            }

            echo json_encode([
                "success" => true,
                "message" => "Cliente actualizado correctamente"
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al actualizar"
            ]);
        }
    }

    public function delete() {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $id = $data['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID requerido"]);
            return;
        }

        try {
            $deleted = $this->clientModel->delete($id);

            if (!$deleted) {
                throw new Exception();
            }

            echo json_encode([
                "success" => true,
                "message" => "Cliente eliminado"
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al eliminar"
            ]);
        }
    }
}