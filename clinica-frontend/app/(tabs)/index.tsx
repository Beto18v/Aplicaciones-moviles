import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  View,
  Animated,
  Pressable,
} from "react-native";
import { useState, useEffect, useRef } from "react";
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

  // Componente para botón animado
  const AnimatedButton = ({
    onPress,
    iconName,
    style,
    iconColor = "#fff",
  }: {
    onPress: () => void;
    iconName: string;
    style: any;
    iconColor?: string;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [style, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons name={iconName as any} size={20} color={iconColor} />
        </Animated.View>
      </Pressable>
    );
  };

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

  // Componente para generar inicial del avatar
  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Componente para tarjeta animada
  const AnimatedPatientCard = ({ item }: { item: Paciente }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shadowAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
        }),
        Animated.spring(shadowAnim, {
          toValue: 1.5,
          useNativeDriver: false,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(shadowAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: false,
        }),
      ]).start();
    };

    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => handleEditarPaciente(item)}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      >
        <Animated.View
          style={[
            styles.pacienteContainer,
            {
              transform: [{ scale: scaleAnim }],
              shadowOpacity: shadowAnim,
            },
          ]}
        >
          {/* Header de la tarjeta */}
          <View style={styles.pacienteHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {getInitials(item.nombre)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.pacienteNombre}>
                {item.nombre}
              </ThemedText>
            </View>
            <View style={styles.botonesContainer}>
              <AnimatedButton
                iconName="pencil-outline"
                style={styles.botonEditar}
                onPress={() => handleEditarPaciente(item)}
                iconColor="#0ea5e9"
              />
              <AnimatedButton
                iconName="trash-outline"
                style={styles.botonEliminar}
                onPress={() => handleEliminarPaciente(item.id)}
                iconColor="#ef4444"
              />
            </View>
          </View>

          {/* Body de la tarjeta */}
          <View style={styles.pacienteBody}>
            <View style={styles.detalleRow}>
              <Ionicons name="card-outline" size={18} color="#64748b" />
              <ThemedText style={styles.detalleTexto}>
                {item.documento}
              </ThemedText>
            </View>
            <View style={styles.detalleRow}>
              <Ionicons name="call-outline" size={18} color="#64748b" />
              <ThemedText style={styles.detalleTexto}>
                {item.telefono}
              </ThemedText>
            </View>
            {item.correo && (
              <View style={styles.detalleRow}>
                <Ionicons name="mail-outline" size={18} color="#64748b" />
                <ThemedText style={styles.detalleTexto}>
                  {item.correo}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  const renderPaciente = ({ item }: { item: Paciente }) => (
    <AnimatedPatientCard item={item} />
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#0ea5e9", dark: "#0369a1" }}
      headerImage={
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <View style={styles.headerIconContainer}>
              <Ionicons
                name="medical"
                size={90}
                color="#ffffff"
                style={styles.headerIcon}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.headerTitle}>Clínica Dental</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Sistema de Gestión
              </ThemedText>
              <View style={styles.headerAccent} />
            </View>
          </View>
        </View>
      }
    >
      <ThemedView style={styles.container}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconContainer}>
              <Ionicons
                name="people"
                size={28}
                color="#0ea5e9"
                style={styles.titleIcon}
              />
            </View>
            <ThemedText style={styles.sectionTitle}>
              Gestión de{'\n'}Pacientes
            </ThemedText>
          </View>
          <AnimatedButton
            iconName={mostrarFormulario ? "close" : "add"}
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
          />
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContainer}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#0ea5e9", // Gradiente azul moderno
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    // Simulando gradiente con sombras y overlay
    shadowColor: "#0369a1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerIconContainer: {
    marginRight: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  headerIcon: {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  headerTextContainer: {
    alignItems: "flex-start",
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1.2,
    marginBottom: 4,
    paddingBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e0f2fe",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  headerAccent: {
    width: 60,
    height: 4,
    backgroundColor: "#22d3ee",
    borderRadius: 2,
    shadowColor: "#22d3ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.1)",
    marginHorizontal: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleIconContainer: {
    backgroundColor: "rgba(14,165,233,0.1)",
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
  },
  titleIcon: {
    // Reutilizando el estilo existente
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.5,
  },
  botonesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  botonEditar: {
    backgroundColor: "rgba(14,165,233,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(14,165,233,0.2)",
    elevation: 2,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  formulario: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.1)",
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "rgba(248,250,252,0.8)",
    color: "#1e293b",
    fontWeight: "500",
    elevation: 2,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonAgregar: {
    backgroundColor: "rgba(14,165,233,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minWidth: 48,
    minHeight: 48,
  },
  botonGuardar: {
    backgroundColor: "rgba(16,185,129,0.9)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  botonEliminar: {
    backgroundColor: "rgba(239,68,68,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(239,68,68,0.2)",
    elevation: 2,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  botonTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lista: {
    flex: 1,
    paddingTop: 8,
  },
  listaContainer: {
    paddingBottom: 24,
  },
  pacienteContainer: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    marginBottom: 18,
    elevation: 8,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.08)",
    marginHorizontal: 6,
    // Efecto glassmorphism mejorado
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.6)",
    // Backdrop blur simulado
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  pacienteHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(14,165,233,0.08)",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(14,165,233,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(14,165,233,0.2)",
    elevation: 4,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0ea5e9",
    letterSpacing: 1,
  },
  pacienteBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
    gap: 12,
  },
  pacienteInfo: {
    marginBottom: 16,
  },
  pacienteNombre: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  pacienteDetalles: {
    gap: 8,
  },
  detalleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 2,
  },
  detalleTexto: {
    fontSize: 15,
    fontWeight: "400",
    color: "#64748b",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  // Estilos adicionales mantenidos del diseño original
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
});
