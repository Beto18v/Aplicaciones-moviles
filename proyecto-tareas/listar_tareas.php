<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Content-Type: application/json; charset=UTF-8");
    include "conexion.php";
    $resultado= $conexion->query("select * from tareas ORDER BY id DESC");
    $tareas=[];

    while($fila=$resultado->fetch_assoc()){
        $tareas[]=$fila;
    }

    echo json_encode($tareas);

    ?>