<?php
    // Configuración de errores
    error_reporting(E_ALL);
    ini_set('display_errors', 0);

    // Headers CORS y tipo de contenido
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Content-Type: application/json; charset=UTF-8");

    // En caso de error, asegurar respuesta JSON
    set_error_handler(function($errno, $errstr, $errfile, $errline) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error del servidor: " . $errstr,
            "error_details" => "$errfile:$errline"
        ]);
        exit;
    });

    include "db.php";

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            $sql = $id 
                ? "SELECT * FROM pacientes WHERE id = ?"
                : "SELECT * FROM pacientes ORDER BY nombre";
            
            $stmt = $conexion->prepare($sql);
            if ($id) $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(["success" => true, "data" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
            break;

        case 'POST':
            try {
                $input = file_get_contents("php://input");
                if (empty($input)) {
                    throw new Exception("No se recibieron datos");
                }
                
                $datos = json_decode($input, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception("Error al procesar JSON: " . json_last_error_msg());
                }
                
                if (!isset($datos['nombre']) || !isset($datos['documento']) || !isset($datos['telefono'])) {
                    throw new Exception("Faltan datos requeridos");
                }

                $stmt = $conexion->prepare("INSERT INTO pacientes (nombre, documento, telefono, correo) VALUES (?, ?, ?, ?)");
                if (!$stmt) {
                    throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
                }

                $correo = isset($datos['correo']) ? $datos['correo'] : null;
                if (!$stmt->bind_param("ssss", 
                    $datos['nombre'],
                    $datos['documento'],
                    $datos['telefono'],
                    $correo
                )) {
                    throw new Exception("Error al vincular parámetros: " . $stmt->error);
                }
                
                if (!$stmt->execute()) {
                    throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
                }

                echo json_encode([
                    "success" => true, 
                    "message" => "Paciente creado exitosamente",
                    "id" => $conexion->insert_id
                ]);
                
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => $e->getMessage()
                ]);
            }
            break;

        case 'DELETE':
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$id) {
                echo json_encode(["success" => false, "message" => "ID requerido"]);
                exit;
            }

            $stmt = $conexion->prepare("DELETE FROM pacientes WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Paciente eliminado correctamente"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al eliminar: " . $conexion->error]);
            }
            break;

        case 'PUT':
            $datos = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($datos['id'])) {
                echo json_encode(["success" => false, "message" => "ID requerido"]);
                exit;
            }

            $campos = ['nombre', 'documento', 'telefono', 'correo'];
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

            $sql = "UPDATE pacientes SET " . implode(", ", $updates) . " WHERE id = ?";
            $tipos .= "i";
            $valores[] = $datos['id'];

            $stmt = $conexion->prepare($sql);
            $stmt->bind_param($tipos, ...$valores);
            echo json_encode($stmt->execute()
                ? ["success" => true, "message" => "Paciente actualizado"]
                : ["success" => false, "message" => "Error: " . $conexion->error]
            );
            break;

        case 'DELETE':
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$id) {
                echo json_encode(["success" => false, "message" => "ID requerido"]);
                exit;
            }

            $stmt = $conexion->prepare("DELETE FROM pacientes WHERE id = ?");
            $stmt->bind_param("i", $id);
            echo json_encode($stmt->execute()
                ? ["success" => true, "message" => "Paciente eliminado"]
                : ["success" => false, "message" => "Error: " . $conexion->error]
            );
            break;
    }

    $conexion->close();
?>