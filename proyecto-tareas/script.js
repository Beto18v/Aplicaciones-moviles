console.log("Js cargado correctamente");
document.getElementById("btn-agregar").addEventListener('click',()=>{
    const titulo = document.getElementById('nueva-tarea').value.trim();
    if(titulo !==""){
        fetch('crear_tarea.php',{
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({titulo: titulo})

        })
        .then(res => res.json())
        .then(data =>{
            if(data.success){
                listarTareas();
                document.getElementById('nueva-tarea').value = "";
            }else{
                alert(data.message);
            }
        })
    }else{
        alert("Escribe un titulo para la tarea");
    }
});

function listarTareas(){
    fetch('listar_tareas.php')
    .then(res => res.json())
    .then(tareas =>{
        const contenedor = document.getElementById('lista-tareas');
        contenedor.innerHTML='';

        tareas.forEach(tarea =>{// for each
            const li = document.createElement('li');
            li.classList.add('tarea-item');

            li.innerHTML=`
                <span class="tarea-texto"><i class="fa-regular fa-clipboard" style="color: #1a90ea;"></i>  ${tarea.titulo} <i class="fa-solid fa-caret-right"></i> ${tarea.estado}</span>
                <div class="botones">
                    <button class="btn-accion" onclick="cambiarEstado(${tarea.id})">${tarea.estado === 'completada'? '<i class="fa-regular fa-face-smile"></i>' : '<i class="fa-regular fa-bell"></i>'} </button>
                    <button class="btn-accion" onclick="eliminarTarea(${tarea.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            contenedor.appendChild(li);
        })
    })
}


function eliminarTarea(id){
    if(confirm("¿Seguro que quieres eliminar esta tarea?"))
    {
        fetch('eliminar_tarea.php',{
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id : id})})
        .then(res => res.json())
        .then(data => {
            if(data.success){
                listarTareas();
            }
            else{
                alert(data.message)
            }
        })
        
    }
    
}


function cambiarEstado(id,estado){
    fetch('cambiar_estado.php',{
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id : id})
    })
    .then(res => res.json())
        .then(data => {
            if(data.success){
                listarTareas();
            }
            else{
                alert(data.message)
            }
             })
            .catch(err => console.error("Error al cambiar el estado", err));
}

listarTareas();





