// Gestión de tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.seccion').forEach(s => s.classList.add('hidden'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-seccion`).classList.remove('hidden');
    });
});

// Gestión de pacientes
document.getElementById("btn-agregar-paciente").addEventListener('click',()=>{
    const nombre = document.getElementById('nombre-paciente').value.trim();
    const documento = document.getElementById('documento-paciente').value.trim();
    const telefono = document.getElementById('telefono-paciente').value.trim();
    const correo = document.getElementById('correo-paciente').value.trim();
    if(nombre !=="" && documento !=="" && telefono !==""){
        fetch('pacientes.php',{
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({nombre, documento, telefono, correo})
        })
        .then(res => res.json())
        .then(data =>{
            if(data.success){
                listarPacientes();
                document.getElementById('nombre-paciente').value = "";
                document.getElementById('documento-paciente').value = "";
                document.getElementById('telefono-paciente').value = "";
                document.getElementById('correo-paciente').value = "";
            }else{
                alert(data.message);
            }
        })
        .catch(() => alert("Error al agregar el paciente"));
    }else{
        alert("Los campos nombre, documento y teléfono son obligatorios");
    }
});

// No se requiere limpiarFormularioPaciente, se hace en el evento

function listarPacientes(){
    fetch('pacientes.php')
    .then(res => res.json())
    .then(data =>{
        const lista = document.getElementById('lista-pacientes');
        lista.innerHTML='';
        data.data.forEach(paciente =>{
            const div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = `
                <div class="item-info">
                    <strong>${paciente.nombre}</strong><br>
                    Doc: ${paciente.documento} | Tel: ${paciente.telefono}
                    ${paciente.correo ? `<br>Email: ${paciente.correo}` : ''}
                </div>
                <div class="item-acciones">
                    <button class="btn-editar" onclick="editarPaciente(${paciente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar" onclick="eliminarPaciente(${paciente.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            lista.appendChild(div);
        });
        // Actualizar select de pacientes en el formulario de citas
        const select = document.getElementById('paciente-cita');
        select.innerHTML = '<option value="">Seleccione un paciente</option>';
        data.data.forEach(paciente => {
            select.innerHTML += `<option value="${paciente.id}">${paciente.nombre} - ${paciente.documento}</option>`;
        });
    })
}

function editarPaciente(id){
    fetch(`pacientes.php?id=${id}`)
    .then(res => res.json())
    .then(data => {
        const paciente = data.data[0];
        mostrarModal('paciente', paciente);
    });
}

function eliminarPaciente(id){
    if(confirm("¿Seguro que quieres eliminar este paciente?")){
        fetch(`pacientes.php?id=${id}`,{
            method:'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                listarPacientes();
            }
            else{
                alert(data.message)
            }
        })
        .catch(() => alert("Error al eliminar el paciente"));
    }
}

// Gestión de citas
document.getElementById('btn-agregar-cita').addEventListener('click', () => {
    const cita = {
        paciente_id: document.getElementById('paciente-cita').value,
        fecha: document.getElementById('fecha-cita').value,
        hora: document.getElementById('hora-cita').value,
        odontologo: document.getElementById('odontologo-cita').value
    };

    if (!cita.paciente_id || !cita.fecha || !cita.hora || !cita.odontologo) {
        alert('Todos los campos son obligatorios');
        return;
    }

    fetch('citas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cita)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            limpiarFormularioCita();
            cargarCitas();
        }
        alert(data.message);
    });
});

function limpiarFormularioCita() {
    document.getElementById('paciente-cita').value = '';
    document.getElementById('fecha-cita').value = '';
    document.getElementById('hora-cita').value = '';
    document.getElementById('odontologo-cita').value = '';
}

function cargarCitas() {
    fetch('citas.php')
        .then(res => res.json())
        .then(data => {
            const lista = document.getElementById('lista-citas');
            lista.innerHTML = '';
            
            data.data.forEach(cita => {
                const div = document.createElement('div');
                div.className = `item estado-${cita.estado}`;
                div.innerHTML = `
                    <div class="item-info">
                        <strong>Paciente ID: ${cita.paciente_id}</strong><br>
                        Fecha: ${cita.fecha} | Hora: ${cita.hora}<br>
                        Odontólogo: ${cita.odontologo} | Estado: ${cita.estado}
                    </div>
                    <div class="item-acciones">
                        <button class="btn-estado" onclick="cambiarEstadoCita(${cita.id})">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-editar" onclick="editarCita(${cita.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-eliminar" onclick="cancelarCita(${cita.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                lista.appendChild(div);
            });
        });
}

function editarCita(id) {
    fetch(`citas.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            const cita = data.data[0];
            mostrarModal('cita', cita);
        });
}

function cancelarCita(id) {
    if (!confirm('¿Está seguro de cancelar esta cita?')) return;
    
    fetch(`citas.php?id=${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) cargarCitas();
        });
}

function cambiarEstadoCita(id) {
    const nuevoEstado = prompt('Ingrese el nuevo estado (pendiente/completada/cancelada):');
    if (!nuevoEstado || !['pendiente', 'completada', 'cancelada'].includes(nuevoEstado)) return;

    fetch('citas.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) cargarCitas();
    });
}

// Gestión del modal
function mostrarModal(tipo, datos) {
    const modal = document.getElementById('modal-edicion');
    const formulario = document.getElementById('formulario-edicion');
    
    if (tipo === 'paciente') {
        formulario.innerHTML = `
            <input type="text" id="edit-nombre" value="${datos.nombre}" placeholder="Nombre">
            <input type="text" id="edit-documento" value="${datos.documento}" placeholder="Documento">
            <input type="text" id="edit-telefono" value="${datos.telefono}" placeholder="Teléfono">
            <input type="email" id="edit-correo" value="${datos.correo || ''}" placeholder="Correo">
            <button onclick="guardarEdicionPaciente(${datos.id})">Guardar</button>
        `;
    } else {
        formulario.innerHTML = `
            <select id="edit-paciente">
                ${document.getElementById('paciente-cita').innerHTML}
            </select>
            <input type="date" id="edit-fecha" value="${datos.fecha}">
            <input type="time" id="edit-hora" value="${datos.hora}">
            <input type="text" id="edit-odontologo" value="${datos.odontologo}" placeholder="Odontólogo">
            <select id="edit-estado">
                <option value="pendiente" ${datos.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="completada" ${datos.estado === 'completada' ? 'selected' : ''}>Completada</option>
                <option value="cancelada" ${datos.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
            </select>
            <button onclick="guardarEdicionCita(${datos.id})">Guardar</button>
        `;
        document.getElementById('edit-paciente').value = datos.paciente_id;
    }
    
    modal.style.display = 'block';
}

function guardarEdicionPaciente(id){
    const paciente = {
        id,
        nombre: document.getElementById('edit-nombre').value,
        documento: document.getElementById('edit-documento').value,
        telefono: document.getElementById('edit-telefono').value,
        correo: document.getElementById('edit-correo').value
    };
    fetch('pacientes.php',{
        method:'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paciente)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.success){
            cerrarModal();
            listarPacientes();
        }
    })
    .catch(() => alert("Error al guardar los cambios del paciente"));
}

function guardarEdicionCita(id) {
    const cita = {
        id,
        paciente_id: document.getElementById('edit-paciente').value,
        fecha: document.getElementById('edit-fecha').value,
        hora: document.getElementById('edit-hora').value,
        odontologo: document.getElementById('edit-odontologo').value,
        estado: document.getElementById('edit-estado').value
    };

    fetch('citas.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cita)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            cerrarModal();
            cargarCitas();
        }
    });
}

function cerrarModal() {
    document.getElementById('modal-edicion').style.display = 'none';
}

document.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);

// Inicialización solo para pacientes
listarPacientes();





