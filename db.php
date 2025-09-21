<?php
// Configuración de errores: mostrar solo en logs, no en pantalla
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Parámetros de conexión
$servidor = "localhost";
$usuario = "root";
$contrasena = "";
$base_datos = "clinica_db";

// Conexión a la base de datos
try {
    $conexion = new mysqli($servidor, $usuario, $contrasena, $base_datos);
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión: " . $conexion->connect_error);
    }
    $conexion->set_charset("utf8");
} catch (Exception $e) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        "success" => false,
        "message" => "No se pudo conectar a la base de datos",
        "error" => $e->getMessage()
    ]);
    exit;
}
