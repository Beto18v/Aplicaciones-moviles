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
      headerBackgroundColor={{ light: "#1a365d", dark: "#0f2a44" }}
      headerImage={
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <Ionicons
              name="medical"
              size={80}
              color="#ffffff"
              style={styles.headerIcon}
            />
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.headerTitle}>Clínica Dental</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Sistema de Gestión
              </ThemedText>
            </View>
          </View>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        <View style={styles.titleSection}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="people"
              size={32}
              color="#1a365d"
              style={styles.titleIcon}
            />
            <ThemedText style={styles.sectionTitle}>
              Gestión de Pacientes
            </ThemedText>
          </View>
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
            <Ionicons
              name={mostrarFormulario ? "close" : "add"}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#f1f5f9",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  headerGradient: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginRight: 20,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  headerTextContainer: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#e2e8f0",
    letterSpacing: 0.5,
    marginTop: 5,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: "#dc2626",
  },
  titleIcon: {
    marginRight: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a365d",
    letterSpacing: 0.5,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  botonEditar: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 12,
    elevation: 4,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
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
    padding: 26,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderTopWidth: 4,
    borderTopColor: "#dc2626",
  },
  input: {
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: "#fafbfc",
    color: "#1e293b",
    fontWeight: "500",
    elevation: 2,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonAgregar: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  botonGuardar: {
    backgroundColor: "#059669",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  botonEliminar: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  botonTexto: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lista: {
    flex: 1,
    paddingTop: 10,
  },
  pacienteContainer: {
    backgroundColor: "#ffffff",
    padding: 22,
    borderRadius: 18,
    marginBottom: 18,
    elevation: 5,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#059669",
  },
  pacienteInfo: {
    marginBottom: 15,
  },
});
