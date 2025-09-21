<?php
header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Content-Type: application/json; charset=UTF-8");
    
include "conexion.php";

$datos = json_decode(file_get_contents("php://input"), true);
$id = intval($datos['id']);

// 1. Obtener el estado actual desde la base de datos
$sql_select = "SELECT estado FROM tareas WHERE id = $id";
$result = $conexion->query($sql_select);

if ($result && $result->num_rows > 0) {
    $fila = $result->fetch_assoc();
    $estado_actual = $fila['estado'];

    // 2. Cambiar el estado
    $nuevo_estado = $estado_actual === 'completada' ? 'pendiente' : 'completada';

    // 3. Guardar en base de datos
    $sql_update = "UPDATE tareas SET estado = '$nuevo_estado' WHERE id = $id";

    if ($conexion->query($sql_update)) {
        echo json_encode([
            "success" => true,
            "message" => "Estado cambiado correctamente"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error al actualizar estado: " . $conexion->error
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Tarea no encontrada"
    ]);
}
?>