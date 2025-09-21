<?php
    $servidor = "localhost";
    $usuario = "root";
    $contrasena = "";
    $base_datos = "tareas_db";



    $conexion = new mysqli($servidor,$usuario,$contrasena,$base_datos) ;
    if($conexion -> connect_error){
        die("error de conxión : " . $conexion -> connect_error);
    }
    


?>