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

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const listaPacientes = await obtenerPacientes();
    setPacientes(listaPacientes);
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    Alert.alert(
      "Editar paciente",
      `¿Desea editar este paciente?\n\nNombre: ${paciente.nombre}\nDocumento: ${
        paciente.documento
      }\nTeléfono: ${paciente.telefono}\nCorreo: ${paciente.correo || "N/A"}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Editar",
          onPress: () => {
            setEditandoPaciente(paciente);
            setNuevoPaciente({
              nombre: paciente.nombre,
              documento: paciente.documento,
              telefono: paciente.telefono,
              correo: paciente.correo || "",
            });
            setMostrarFormulario(true);
          },
        },
      ]
    );
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

  const handleEliminarPaciente = (id: number) => {
    Alert.alert("Confirmar", "¿Está seguro de eliminar este paciente?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, eliminar",
        onPress: async () => {
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
        },
      },
    ]);
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
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafb",
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  botonEditar: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    elevation: 3,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  formulario: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#0066cc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#e8f4f8",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1e7dd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafcfc",
    color: "#2c3e50",
    fontWeight: "500",
  },
  botonAgregar: {
    backgroundColor: "#0066cc",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#0066cc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  botonGuardar: {
    backgroundColor: "#28a745",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  botonEliminar: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#dc3545",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  botonTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  lista: {
    flex: 1,
    paddingTop: 8,
  },
  pacienteContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#0066cc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  pacienteInfo: {
    marginBottom: 12,
  },
});
