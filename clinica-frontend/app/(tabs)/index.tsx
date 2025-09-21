import { Image } from "expo-image";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  View,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Paciente } from "../types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  obtenerPacientes,
  agregarPaciente,
  eliminarPaciente,
  actualizarPaciente,
} from "../../api";

export default function HomeScreen() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    correo: "",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoPaciente, setEditandoPaciente] = useState<Paciente | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const listaPacientes = await obtenerPacientes();
    setPacientes(listaPacientes);
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    setEditandoPaciente(paciente);
    setNuevoPaciente({
      nombre: paciente.nombre,
      documento: paciente.documento,
      telefono: paciente.telefono,
      correo: paciente.correo || "",
    });
    setMostrarFormulario(true);
  };

  const handleAgregarPaciente = async () => {
    if (
      !nuevoPaciente.nombre ||
      !nuevoPaciente.documento ||
      !nuevoPaciente.telefono
    ) {
      Alert.alert("Error", "Por favor complete los campos obligatorios");
      return;
    }

    let resultado;
    if (editandoPaciente) {
      resultado = await actualizarPaciente(editandoPaciente.id, nuevoPaciente);
    } else {
      resultado = await agregarPaciente(nuevoPaciente);
    }

    if (resultado.success) {
      Alert.alert(
        "Éxito",
        editandoPaciente
          ? "Paciente actualizado correctamente"
          : "Paciente agregado correctamente"
      );
      setNuevoPaciente({ nombre: "", documento: "", telefono: "", correo: "" });
      setMostrarFormulario(false);
      setEditandoPaciente(null);
      cargarPacientes();
    } else {
      Alert.alert(
        "Error",
        resultado.message || "No se pudo procesar la operación"
      );
    }
  };

  const handleDeleteConfirmed = async (id: number) => {
    const resultado = await eliminarPaciente(id);
    if (resultado.success) {
      cargarPacientes();
      Alert.alert("Éxito", "Paciente eliminado correctamente");
    } else {
      Alert.alert(
        "Error",
        resultado.message || "No se pudo eliminar el paciente"
      );
    }
  };

  const handleEliminarPaciente = (id: number) => {
    setConfirmDeleteId(id);
  };

  const renderPaciente = ({ item }: { item: Paciente }) => (
    <ThemedView style={styles.pacienteContainer}>
      <ThemedView style={styles.pacienteInfo}>
        <ThemedText type="subtitle">{item.nombre}</ThemedText>
        <ThemedText>Documento: {item.documento}</ThemedText>
        <ThemedText>Teléfono: {item.telefono}</ThemedText>
        {item.correo && <ThemedText>Correo: {item.correo}</ThemedText>}
      </ThemedView>
      <View style={styles.botonesContainer}>
        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => handleEditarPaciente(item)}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() => handleEliminarPaciente(item.id)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Gestión de Pacientes</ThemedText>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => {
            if (mostrarFormulario) {
              setEditandoPaciente(null);
              setNuevoPaciente({
                nombre: "",
                documento: "",
                telefono: "",
                correo: "",
              });
            }
            setMostrarFormulario(!mostrarFormulario);
          }}
        >
          <ThemedText style={styles.botonTexto}>
            {mostrarFormulario ? "Cancelar" : "Agregar Paciente"}
          </ThemedText>
        </TouchableOpacity>{" "}
        {mostrarFormulario && (
          <ThemedView style={styles.formulario}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nuevoPaciente.nombre}
              onChangeText={(text) =>
                setNuevoPaciente({ ...nuevoPaciente, nombre: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Documento"
              value={nuevoPaciente.documento}
              onChangeText={(text) =>
                setNuevoPaciente({ ...nuevoPaciente, documento: text })
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={nuevoPaciente.telefono}
              onChangeText={(text) =>
                setNuevoPaciente({ ...nuevoPaciente, telefono: text })
              }
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Correo (opcional)"
              value={nuevoPaciente.correo}
              onChangeText={(text) =>
                setNuevoPaciente({ ...nuevoPaciente, correo: text })
              }
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={styles.botonGuardar}
              onPress={handleAgregarPaciente}
            >
              <ThemedText style={styles.botonTexto}>Guardar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        <FlatList
          data={pacientes}
          renderItem={renderPaciente}
          keyExtractor={(item) => item.id.toString()}
          style={styles.lista}
        />
        {confirmDeleteId && (
          <ThemedView style={styles.confirmacion}>
            <ThemedText>¿Está seguro de eliminar este paciente?</ThemedText>
            <View style={styles.botonesConfirmacion}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setConfirmDeleteId(null)}
              >
                <ThemedText style={styles.botonTexto}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonEliminarConfirm}
                onPress={() => {
                  handleDeleteConfirmed(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                <ThemedText style={styles.botonTexto}>Eliminar</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botonEditar: {
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  formulario: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  botonAgregar: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: "center",
  },
  botonGuardar: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  botonEliminar: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 4,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  lista: {
    flex: 1,
  },
  pacienteContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pacienteInfo: {
    marginBottom: 8,
  },
  confirmacion: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonesConfirmacion: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  botonCancelar: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  botonEliminarConfirm: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
});
