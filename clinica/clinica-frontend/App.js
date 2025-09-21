import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState('');

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      const response = await fetch('http://10.1.169.181:8080/tareas');
      const data = await response.json();
      setTareas(data);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  };

  const agregarTarea = async () => {
    if (!nuevaTarea.trim()) return;

    try {
      const response = await fetch('http://10.1.169.181:8081/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevaTarea, estado: 'pendiente' }),
      });

      const data = await response.json();
      setTareas([...tareas, data]);
      setNuevaTarea('');
    } catch (error) {
      console.error('Error al agregar tarea:', error);
    }
  };

  const eliminarTarea = async (id) => {
    try {
      await fetch(`http://10.1.169.181:8081/tareas/${id}`, { method: 'DELETE' });
      setTareas(tareas.filter((tarea) => tarea.id !== id));
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  const completarTarea = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'pendiente' ? 'completada' : 'pendiente';

      const response = await fetch(`http://10.1.169.181:8081/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();
      setTareas(tareas.map((t) => (t.id === id ? data : t)));
    } catch (error) {
      console.error('Error actualizando tarea:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestor de Tareas</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe una nueva tarea"
        value={nuevaTarea}
        onChangeText={setNuevaTarea}
      />
      <Button title="Agregar Tarea" onPress={agregarTarea} />

      <FlatList
        data={tareas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tareaContainer}>
            <Text style={item.estado === 'completada' ? styles.tareaCompletada : styles.tareaPendiente}>
              {item.titulo}
            </Text>
            <View style={styles.botones}>
              <Button
                title={item.estado === 'pendiente' ? 'Completar' : 'Reabrir'}
                onPress={() => completarTarea(item.id, item.estado)}
              />
              <Button title="Eliminar" color="red" onPress={() => eliminarTarea(item.id)} />
            </View>
          </View>
        )}
      />
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  tareaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  tareaCompletada: {
    textDecorationLine: 'line-through',
    color: '#9de26eff',
    fontSize: 18,
  },
  tareaPendiente: {
    color: '#000',
    fontSize: 18,
  },
  botones: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
});
