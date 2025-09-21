import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import api from './api';

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    correo: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pacientesData, citasData] = await Promise.all([
        api.obtenerPacientes(),
        api.obtenerCitas()
      ]);
      setPacientes(pacientesData);
      setCitas(citasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const agregarPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.documento || !nuevoPaciente.telefono) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    try {
      const resultado = await api.agregarPaciente(nuevoPaciente);
      if (resultado.success) {
        alert('Paciente agregado exitosamente');
        setNuevoPaciente({
          nombre: '',
          documento: '',
          telefono: '',
          correo: ''
        });
        setMostrarFormPaciente(false);
        cargarDatos();
      } else {
        alert(resultado.message);
      }
    } catch (error) {
      console.error('Error al agregar paciente:', error);
      alert('Error al agregar paciente');
    }
  };

  const renderPaciente = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.pacienteInfo}>
        <Text style={styles.nombrePaciente}>{item.nombre}</Text>
        <Text>Doc: {item.documento}</Text>
        <Text>Tel: {item.telefono}</Text>
        {item.correo && <Text>Email: {item.correo}</Text>}
      </View>
      <View style={styles.botonesContainer}>
        <TouchableOpacity
          style={[styles.boton, styles.botonCita]}
          onPress={() => alert('Función de agendar cita en desarrollo')}>
          <Text style={styles.botonTexto}>Agendar Cita</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boton, styles.botonEliminar]}
          onPress={() => confirmarEliminarPaciente(item.id)}>
          <Text style={styles.botonTexto}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const confirmarEliminarPaciente = async (id) => {
    // En una versión más completa, aquí iría un diálogo de confirmación
    try {
      const resultado = await api.eliminarPaciente(id);
      if (resultado.success) {
        alert('Paciente eliminado exitosamente');
        cargarDatos();
      } else {
        alert(resultado.message);
      }
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      alert('Error al eliminar paciente');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clínica Dental</Text>
      
      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => setMostrarFormPaciente(!mostrarFormPaciente)}>
        <Text style={styles.botonTexto}>
          {mostrarFormPaciente ? 'Cancelar' : 'Agregar Paciente'}
        </Text>
      </TouchableOpacity>

      {mostrarFormPaciente ? (
        <View style={styles.formulario}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={nuevoPaciente.nombre}
            onChangeText={(texto) => setNuevoPaciente({...nuevoPaciente, nombre: texto})}
          />
          <TextInput
            style={styles.input}
            placeholder="Documento"
            value={nuevoPaciente.documento}
            onChangeText={(texto) => setNuevoPaciente({...nuevoPaciente, documento: texto})}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={nuevoPaciente.telefono}
            onChangeText={(texto) => setNuevoPaciente({...nuevoPaciente, telefono: texto})}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Correo (opcional)"
            value={nuevoPaciente.correo}
            onChangeText={(texto) => setNuevoPaciente({...nuevoPaciente, correo: texto})}
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={agregarPaciente}>
            <Text style={styles.botonTexto}>Guardar Paciente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPaciente}
          style={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    borderColor: '#bdc3c7',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pacienteInfo: {
    marginBottom: 10,
  },
  nombrePaciente: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  boton: {
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  botonCita: {
    backgroundColor: '#3498db',
  },
  botonEliminar: {
    backgroundColor: '#e74c3c',
  },
  botonAgregar: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  botonGuardar: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  formulario: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  lista: {
    flex: 1,
  },
});
