import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  View,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
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

  const renderCita = ({ item }: { item: Cita }) => {
    const paciente = pacientes.find((p) => p.id === parseInt(item.paciente_id));
    return (
      <ThemedView style={styles.citaContainer}>
        <ThemedView style={styles.citaInfo}>
          <ThemedText type="subtitle">
            {paciente ? paciente.nombre : "Paciente no encontrado"}
          </ThemedText>
          <ThemedText>Fecha: {item.fecha}</ThemedText>
          <ThemedText>Hora: {item.hora}</ThemedText>
          <ThemedText>Odontólogo: {item.odontologo}</ThemedText>
          <ThemedText>Estado: {item.estado}</ThemedText>
        </ThemedView>
        {item.estado !== "cancelada" && (
          <View style={styles.botonesContainer}>
            <TouchableOpacity
              style={styles.botonCompletar}
              onPress={() => handleCompletarCita(item.id)}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => handleCancelarCita(item.id)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#7c3aed", dark: "#5b21b6" }}
      headerImage={
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <Ionicons
              name="calendar"
              size={80}
              color="#ffffff"
              style={styles.headerIcon}
            />
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.headerTitle}>Agenda Médica</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Control de Citas
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
              name="time"
              size={32}
              color="#7c3aed"
              style={styles.titleIcon}
            />
            <ThemedText style={styles.sectionTitle}>
              Gestión de Citas
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.botonAgregar}
            onPress={() => setMostrarFormulario(!mostrarFormulario)}
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
          data={citas}
          renderItem={renderCita}
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
    padding: 8,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#7c3aed",
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
    marginBottom: 16,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    marginHorizontal: 4,
  },
  titleIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7c3aed",
    letterSpacing: 0.5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fafbfc",
    elevation: 2,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "500",
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
  formulario: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderTopWidth: 3,
    borderTopColor: "#f59e0b",
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fafbfc",
    color: "#1e293b",
    fontWeight: "500",
    elevation: 1,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botonAgregar: {
    backgroundColor: "#f59e0b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  botonGuardar: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  botonCancelar: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botonCompletar: {
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    elevation: 3,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botonTexto: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  lista: {
    flex: 1,
    paddingTop: 8,
  },
  citaContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    marginHorizontal: 4,
  },
  citaInfo: {
    marginBottom: 10,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  inputFecha: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafbfc",
    elevation: 2,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  fechaTexto: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
});
