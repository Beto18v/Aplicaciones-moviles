import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  View,
  Platform,
  Animated,
  Pressable,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Paciente, Cita } from "../types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  obtenerCitas,
  agregarCita,
  obtenerPacientes,
  actualizarCita,
} from "../../api";

const doctores = [
  { id: 1, nombre: "Dr. Juan Pérez" },
  { id: 2, nombre: "Dr. María García" },
  { id: 3, nombre: "Dr. Carlos López" },
  { id: 4, nombre: "Dr. Ana Rodríguez" },
];

export default function TabTwoScreen() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [citasFiltradas, setCitasFiltradas] = useState<Cita[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [nuevaCita, setNuevaCita] = useState({
    paciente_id: "",
    fecha: "",
    hora: "",
    odontologo: "",
    estado: "pendiente",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  // Componente para generar inicial del avatar
  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Función para filtrar citas
  const filtrarCitas = (estado: string) => {
    setFiltroEstado(estado);
    if (estado === "todas") {
      setCitasFiltradas(citas);
    } else {
      setCitasFiltradas(citas.filter((cita) => cita.estado === estado));
    }
  };

  // Botón de filtro
  const FilterButton = ({
    estado,
    titulo,
  }: {
    estado: string;
    titulo: string;
  }) => {
    const isActive = filtroEstado === estado;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => filtrarCitas(estado)}
      >
        <ThemedText
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {titulo}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Componente para botón animado FAB
  const AnimatedFAB = ({
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
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "45deg"],
    });

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [style, { opacity: pressed ? 0.9 : 1 }]}
      >
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              { rotate: iconName === "close" ? rotation : "0deg" },
            ],
          }}
        >
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </Animated.View>
      </Pressable>
    );
  };

  // Función para obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "#10b981";
      case "cancelada":
        return "#ef4444";
      case "pendiente":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  // Función para obtener ícono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "checkmark-circle";
      case "cancelada":
        return "close-circle";
      case "pendiente":
        return "time";
      default:
        return "help-circle";
    }
  };

  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    let hour = 5;
    let minutes = 0;

    while (hour < 18 || (hour === 17 && minutes <= 30)) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);

      minutes += 30;
      if (minutes >= 60) {
        minutes = 0;
        hour += 1;
      }
    }

    return slots;
  };

  const formatearFecha = (fecha: Date): string => {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const day = fecha.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCambioFecha = (event: any, selectedDate?: Date) => {
    setMostrarDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFechaSeleccionada(selectedDate);
      const fechaFormateada = formatearFecha(selectedDate);
      setNuevaCita({ ...nuevaCita, fecha: fechaFormateada });
    }
  };

  const mostrarSelectorFecha = () => {
    setMostrarDatePicker(true);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (filtroEstado === "todas") {
      setCitasFiltradas(citas);
    } else {
      setCitasFiltradas(citas.filter((cita) => cita.estado === filtroEstado));
    }
  }, [citas, filtroEstado]);

  const cargarDatos = async () => {
    const [citasData, pacientesData] = await Promise.all([
      obtenerCitas(),
      obtenerPacientes(),
    ]);
    setCitas(citasData);
    setPacientes(pacientesData);
  };

  const handleAgregarCita = async () => {
    if (
      !nuevaCita.paciente_id ||
      !nuevaCita.fecha ||
      !nuevaCita.hora ||
      !nuevaCita.odontologo
    ) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }

    const citaParaEnviar = {
      ...nuevaCita,
      fecha: nuevaCita.fecha,
      hora: nuevaCita.hora,
    };

    const resultado = await agregarCita(citaParaEnviar);
    if (resultado.success) {
      Alert.alert("Éxito", "Cita agendada correctamente");
      setNuevaCita({
        paciente_id: "",
        fecha: "",
        hora: "",
        odontologo: "",
        estado: "pendiente",
      });
      setMostrarFormulario(false);
      cargarDatos();
    } else {
      Alert.alert("Error", resultado.message || "No se pudo agendar la cita");
    }
  };

  const handleCancelarCita = async (id: number) => {
    Alert.alert("Confirmar", "¿Está seguro de cancelar esta cita?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        onPress: async () => {
          const resultado = await actualizarCita(id, { estado: "cancelada" });
          if (resultado.success) {
            cargarDatos();
            Alert.alert("Éxito", "Cita cancelada correctamente");
          } else {
            Alert.alert(
              "Error",
              resultado.message || "No se pudo cancelar la cita"
            );
          }
        },
      },
    ]);
  };

  const handleCompletarCita = async (id: number) => {
    Alert.alert(
      "Confirmar",
      "¿Está seguro de marcar esta cita como confirmada?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, confirmar",
          onPress: async () => {
            const resultado = await actualizarCita(id, {
              estado: "confirmada",
            });
            if (resultado.success) {
              cargarDatos();
              Alert.alert("Éxito", "Cita confirmada correctamente");
            } else {
              Alert.alert(
                "Error",
                resultado.message || "No se pudo confirmar la cita"
              );
            }
          },
        },
      ]
    );
  };

  // Componente de tarjeta de cita simplificado
  const CitaCard = ({ item, index }: { item: Cita; index: number }) => {
    const paciente = pacientes.find((p) => p.id === parseInt(item.paciente_id));
    const isLastItem = index === citasFiltradas.length - 1;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={styles.timelineContainer}>
        {/* Timeline Line */}
        <View style={styles.timelineLineContainer}>
          <View
            style={[
              styles.timelineCircle,
              { backgroundColor: getEstadoColor(item.estado) },
            ]}
          >
            <Ionicons
              name={getEstadoIcon(item.estado) as any}
              size={16}
              color="#ffffff"
            />
          </View>
          {!isLastItem && (
            <View
              style={[
                styles.timelineLine,
                { backgroundColor: getEstadoColor(item.estado) + "40" },
              ]}
            />
          )}
        </View>

        {/* Cita Card */}
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ flex: 1 }}
        >
          <Animated.View
            style={[
              styles.citaContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Header de la tarjeta */}
            <View style={styles.citaHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <ThemedText style={styles.avatarText}>
                      {paciente ? getInitials(paciente.nombre) : "?"}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.headerTextContainer}>
                  <ThemedText style={styles.pacienteNombre}>
                    {paciente ? paciente.nombre : "Paciente no encontrado"}
                  </ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.estadoBadge,
                  { backgroundColor: getEstadoColor(item.estado) },
                ]}
              >
                <ThemedText style={styles.estadoTexto}>
                  {item.estado.toUpperCase()}
                </ThemedText>
              </View>
            </View>

            {/* Body de la tarjeta */}
            <View style={styles.citaBody}>
              <View style={styles.detalleRow}>
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <ThemedText style={styles.detalleTexto}>
                  {item.fecha}
                </ThemedText>
              </View>
              <View style={styles.detalleRow}>
                <Ionicons name="time-outline" size={18} color="#6b7280" />
                <ThemedText style={styles.detalleTexto}>{item.hora}</ThemedText>
              </View>
              <View style={styles.detalleRow}>
                <Ionicons name="person-outline" size={18} color="#6b7280" />
                <ThemedText style={styles.detalleTexto}>
                  {item.odontologo}
                </ThemedText>
              </View>
            </View>

            {/* Botones de acción tradicionales */}
            {item.estado !== "cancelada" && (
              <View style={styles.botonesContainer}>
                <AnimatedFAB
                  iconName="checkmark"
                  style={styles.botonCompletar}
                  onPress={() => handleCompletarCita(item.id)}
                  iconColor="#10b981"
                />
                <AnimatedFAB
                  iconName="close"
                  style={styles.botonCancelar}
                  onPress={() => handleCancelarCita(item.id)}
                  iconColor="#ef4444"
                />
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  const renderCita = ({ item, index }: { item: Cita; index: number }) => (
    <CitaCard item={item} index={index} />
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#a855f7", dark: "#7c3aed" }}
      headerImage={
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <View style={styles.headerIconContainer}>
              <Ionicons
                name="calendar"
                size={90}
                color="#ffffff"
                style={styles.headerIcon}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.headerTitle}>Agenda Médica</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Control de Citas
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
                name="time"
                size={28}
                color="#a855f7"
                style={styles.titleIcon}
              />
            </View>
            <ThemedText style={styles.sectionTitle}>
              Gestión de{"\n"}Citas
            </ThemedText>
          </View>
          <AnimatedFAB
            iconName={mostrarFormulario ? "close" : "add"}
            style={styles.botonAgregar}
            onPress={() => setMostrarFormulario(!mostrarFormulario)}
          />
        </View>

        {/* Filtros de Estado */}
        <View style={styles.filtersContainer}>
          <FilterButton estado="todas" titulo="Todas" />
          <FilterButton estado="pendiente" titulo="Pendientes" />
          <FilterButton estado="confirmada" titulo="Confirmadas" />
          <FilterButton estado="cancelada" titulo="Canceladas" />
        </View>

        {mostrarFormulario && (
          <ThemedView style={styles.formulario}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={nuevaCita.paciente_id}
                style={styles.picker}
                onValueChange={(itemValue: string) =>
                  setNuevaCita({ ...nuevaCita, paciente_id: itemValue })
                }
              >
                <Picker.Item label="Seleccione un paciente" value="" />
                {pacientes.map((paciente) => (
                  <Picker.Item
                    key={paciente.id}
                    label={`${paciente.nombre} - ${paciente.documento}`}
                    value={paciente.id.toString()}
                  />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.inputFecha}
              onPress={mostrarSelectorFecha}
            >
              <ThemedText style={styles.fechaTexto}>
                {nuevaCita.fecha || "Seleccionar fecha"}
              </ThemedText>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            {mostrarDatePicker && (
              <DateTimePicker
                value={fechaSeleccionada}
                mode="date"
                display="default"
                onChange={handleCambioFecha}
                minimumDate={new Date()}
              />
            )}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={nuevaCita.hora}
                style={styles.picker}
                onValueChange={(itemValue: string) => {
                  // Verificar si el horario está disponible para la fecha seleccionada
                  const fechaSeleccionada = nuevaCita.fecha;
                  const citaExistente = citas.find(
                    (cita) =>
                      cita.fecha === fechaSeleccionada &&
                      cita.hora === itemValue &&
                      cita.estado !== "cancelada"
                  );

                  if (citaExistente) {
                    Alert.alert(
                      "Horario no disponible",
                      "Ya existe una cita en este horario."
                    );
                    return;
                  }

                  setNuevaCita({ ...nuevaCita, hora: itemValue });
                }}
              >
                <Picker.Item label="Seleccione un horario" value="" />
                {generateTimeSlots().map((slot) => (
                  <Picker.Item key={slot} label={slot} value={slot} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={nuevaCita.odontologo}
                style={styles.picker}
                onValueChange={(itemValue: string) =>
                  setNuevaCita({ ...nuevaCita, odontologo: itemValue })
                }
              >
                <Picker.Item label="Seleccione un odontólogo" value="" />
                {doctores.map((doctor) => (
                  <Picker.Item
                    key={doctor.id}
                    label={doctor.nombre}
                    value={doctor.nombre}
                  />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.botonGuardar}
              onPress={handleAgregarCita}
            >
              <ThemedText style={styles.botonTexto}>Guardar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        <FlatList
          data={citasFiltradas}
          renderItem={renderCita}
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
    backgroundColor: "#faf5ff",
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
    backgroundColor: "#a855f7", // Gradiente morado moderno
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    // Simulando gradiente morado → fucsia
    shadowColor: "#ec4899",
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
    fontSize: 28,
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
    color: "#ffffff",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  headerAccent: {
    width: 60,
    height: 4,
    backgroundColor: "#ec4899",
    borderRadius: 2,
    shadowColor: "#ec4899",
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
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.1)",
    marginHorizontal: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleIconContainer: {
    backgroundColor: "rgba(168,85,247,0.1)",
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
  // Estilos para filtros
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.2)",
    elevation: 2,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: "rgba(168,85,247,0.9)",
    borderColor: "#a855f7",
    elevation: 4,
    shadowOpacity: 0.2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a855f7",
    textAlign: "center",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  // Estilos para avatar y swipe
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(168,85,247,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(168,85,247,0.2)",
    elevation: 3,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#a855f7",
    letterSpacing: 0.5,
  },
  // Timeline Styles mejorados
  timelineContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingLeft: 8,
  },
  timelineLineContainer: {
    alignItems: "center",
    marginRight: 12,
    width: 36,
  },
  timelineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: "#ffffff",
    zIndex: 1,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    marginTop: 8,
    minHeight: 80,
    borderRadius: 2,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  // Cita Card Styles
  citaContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    flex: 1,
    borderRadius: 24,
    elevation: 6,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.08)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
  },
  citaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(168,85,247,0.08)",
  },
  citaBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  botonCompletar: {
    backgroundColor: "rgba(236, 255, 233, 0.9)",
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(16,185,129,0.4)",
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  botonCancelar: {
    backgroundColor: "rgba(255, 233, 233, 0.9)",
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(239,68,68,0.4)",
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  pacienteNombre: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.4,
    lineHeight: 24,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignSelf: "flex-start",
  },
  estadoTexto: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  detalleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 2,
  },
  detalleTexto: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  // Form Styles
  formulario: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.1)",
    marginHorizontal: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.2)",
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "rgba(250,245,255,0.8)",
    elevation: 2,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "500",
  },
  inputFecha: {
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(250,245,255,0.8)",
    elevation: 2,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fechaTexto: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  botonAgregar: {
    backgroundColor: "rgba(168,85,247,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#a855f7",
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
  botonTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lista: {
    flex: 1,
  },
  listaContainer: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  // Estilos heredados mantenidos
  input: {
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "rgba(250,245,255,0.8)",
    color: "#1e293b",
    fontWeight: "500",
    elevation: 2,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerImage: {
    width: 200,
    height: 200,
    position: "absolute",
    bottom: -50,
    right: -50,
    opacity: 0.3,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  citaInfo: {
    marginBottom: 10,
  },
});
