<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Content-Type: application/json; charset=UTF-8");
    
    
    
    include "conexion.php";

    // Recibir datos en formato JSON
    $datos = json_decode(file_get_contents("php://input"), true);
    $titulo = isset($datos["titulo"]) ? trim($datos["titulo"]) : "";

    if(empty($titulo)){
        echo json_encode([
            "success" => false,
            "message" =>"El titulo de la tarea no puede estar vacio"]);
        exit;
    }

    // Preparar consulta SQL
    $stmt = $conexion->prepare("INSERT INTO tareas (titulo) VALUES (?)");
    $stmt->bind_param("s", $titulo);

    // Ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Tarea creada correctamente"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error al crear la tarea: " . $conexion->error
        ]);
    }

    // Cerrar conexiones
    $stmt->close();
    $conexion->close();
?>