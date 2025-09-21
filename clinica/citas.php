<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Content-Type: application/json; charset=UTF-8");

    include "db.php";

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            $sql = $id 
                ? "SELECT * FROM citas WHERE id = ?"
                : "SELECT * FROM citas ORDER BY fecha, hora";
            
            $stmt = $conexion->prepare($sql);
            if ($id) $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(["success" => true, "data" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
            break;

        case 'POST':
            $datos = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($datos['paciente_id']) || !isset($datos['fecha']) || !isset($datos['hora']) || !isset($datos['odontologo'])) {
                echo json_encode(["success" => false, "message" => "Faltan datos requeridos"]);
                exit;
            }

            $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM citas WHERE fecha = ? AND hora = ? AND estado != 'cancelada'");
            $stmt->bind_param("ss", $datos['fecha'], $datos['hora']);
            $stmt->execute();
            if ($stmt->get_result()->fetch_assoc()['total'] > 0) {
                echo json_encode(["success" => false, "message" => "Horario no disponible"]);
                exit;
            }

            $stmt = $conexion->prepare("INSERT INTO citas (paciente_id, fecha, hora, odontologo, estado) VALUES (?, ?, ?, ?, 'pendiente')");
            $stmt->bind_param("ssss", $datos['paciente_id'], $datos['fecha'], $datos['hora'], $datos['odontologo']);
            
            echo json_encode($stmt->execute() 
                ? ["success" => true, "message" => "Cita creada", "id" => $conexion->insert_id]
                : ["success" => false, "message" => "Error: " . $conexion->error]
            );
            break;

        case 'PUT':
            $datos = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($datos['id'])) {
                echo json_encode(["success" => false, "message" => "ID requerido"]);
                exit;
            }

            $campos = ['fecha', 'hora', 'odontologo', 'estado'];
            $updates = [];
            $valores = [];
            $tipos = "";

            foreach ($campos as $campo) {
                if (isset($datos[$campo])) {
                    $updates[] = "$campo = ?";
                    $valores[] = $datos[$campo];
                    $tipos .= "s";
                }
            }

            if (empty($updates)) {
                echo json_encode(["success" => false, "message" => "Sin datos para actualizar"]);
                exit;
            }

            if (isset($datos['fecha']) || isset($datos['hora'])) {
                $fecha = $datos['fecha'] ?? null;
                $hora = $datos['hora'] ?? null;
                
                if ($fecha && $hora) {
                    $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM citas WHERE fecha = ? AND hora = ? AND estado != 'cancelada' AND id != ?");
                    $stmt->bind_param("ssi", $fecha, $hora, $datos['id']);
                    $stmt->execute();
                    if ($stmt->get_result()->fetch_assoc()['total'] > 0) {
                        echo json_encode(["success" => false, "message" => "Horario no disponible"]);
                        exit;
                    }
                }
            }

            $sql = "UPDATE citas SET " . implode(", ", $updates) . " WHERE id = ?";
            $tipos .= "i";
            $valores[] = $datos['id'];

            $stmt = $conexion->prepare($sql);
            $stmt->bind_param($tipos, ...$valores);
            echo json_encode($stmt->execute()
                ? ["success" => true, "message" => "Cita actualizada"]
                : ["success" => false, "message" => "Error: " . $conexion->error]
            );
            break;

        case 'DELETE':
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$id) {
                echo json_encode(["success" => false, "message" => "ID requerido"]);
                exit;
            }

            $stmt = $conexion->prepare("UPDATE citas SET estado = 'cancelada' WHERE id = ?");
            $stmt->bind_param("i", $id);
            echo json_encode($stmt->execute()
                ? ["success" => true, "message" => "Cita cancelada"]
                : ["success" => false, "message" => "Error: " . $conexion->error]
            );
            break;
    }

    $conexion->close();
?>