<?php

class Cliente {

    private $conn;
    private $table = "clientes";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getPaginated($limit, $offset, $search = "") {
        $search = trim((string)$search);

        if ($search !== "") {
            $sql = "SELECT *
                    FROM {$this->table}
                    WHERE nombres LIKE :search
                       OR apellido_paterno LIKE :search
                       OR apellido_materno LIKE :search
                       OR email LIKE :search
                       OR domicilio LIKE :search
                    ORDER BY id DESC
                    LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':search', "%{$search}%", PDO::PARAM_STR);
        } else {
            $sql = "SELECT *
                    FROM {$this->table}
                    ORDER BY id DESC
                    LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($sql);
        }

        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

     public function count($search = "") {
        $search = trim((string)$search);

        if ($search !== "") {
            $sql = "SELECT COUNT(*) as total
                    FROM {$this->table}
                    WHERE nombres LIKE :search
                       OR apellido_paterno LIKE :search
                       OR apellido_materno LIKE :search
                       OR email LIKE :search
                       OR domicilio LIKE :search";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':search', "%{$search}%", PDO::PARAM_STR);
            $stmt->execute();
        } else {
            $stmt = $this->conn->query("SELECT COUNT(*) as total FROM {$this->table}");
        }

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['total'] ?? 0);
    }

    public function create($data) {
        $sql = "INSERT INTO $this->table 
                (nombres, apellido_paterno, apellido_materno, domicilio, email)
                VALUES (:nombres, :ap, :am, :dom, :email)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':nombres' => $data['nombres'],
            ':ap' => $data['apellido_paterno'],
            ':am' => $data['apellido_materno'],
            ':dom' => $data['domicilio'],
            ':email' => $data['email']
        ]);
    }

    public function getAll() {
        $stmt = $this->conn->query("SELECT * FROM $this->table");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id, $data) {
        $sql = "UPDATE $this->table SET
                nombres=:nombres,
                apellido_paterno=:ap,
                apellido_materno=:am,
                domicilio=:dom,
                email=:email
                WHERE id=:id";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':id' => $id,
            ':nombres' => $data['nombres'],
            ':ap' => $data['apellido_paterno'],
            ':am' => $data['apellido_materno'],
            ':dom' => $data['domicilio'],
            ':email' => $data['email']
        ]);
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM $this->table WHERE id=:id");
        return $stmt->execute([':id' => $id]);
    }

}
