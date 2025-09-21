<?php
    // Asegurarnos de que los errores de PHP no muestren HTML
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    
    // Configuración de la base de datos
    $servidor = "localhost";
    $usuario = "root";
    $contrasena = "";
    $base_datos = "clinica_db";

    try {
        // Crear conexión
        $conexion = new mysqli($servidor, $usuario, $contrasena, $base_datos);
        
        if ($conexion->connect_error) {
            throw new Exception("Error de conexión: " . $conexion->connect_error);
        }
        
        // Asegurar que la conexión use UTF-8
        $conexion->set_charset("utf8");
        
    } catch (Exception $e) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
        exit;
    }
    


?>