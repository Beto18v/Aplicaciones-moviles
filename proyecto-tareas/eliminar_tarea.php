<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Content-Type: application/json; charset=UTF-8");

include "conexion.php";

// Recibir datos en formato JSON
$datos = json_decode(file_get_contents("php://input"), true);
$id = isset($datos["id"]) ? intval($datos["id"]) : 0;

// Validar que el id sea válido
if ($id <= 0) {
    echo json_encode([
        "exito" => false,
        "mensaje" => "ID inválido"
    ]);
    exit;
}

// Preparar consulta SQL para eliminar
$stmt = $conexion->prepare("DELETE FROM tareas WHERE id = ?");
$stmt->bind_param("i", $id);

// Ejecutar consulta
if ($stmt->execute()) {
    echo json_encode([
        "exito" => true,
        "mensaje" => "Tarea eliminada correctamente"
    ]);
} else {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Error al eliminar: " . $conexion->error
    ]);
}

// Cerrar conexiones
$stmt->close();
$conexion->close();
    

?>