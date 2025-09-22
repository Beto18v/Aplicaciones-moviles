import { Image } from "expo-image";
import {
  StyleSheet,
  TextInput,
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
    if (!nuevaCita.paciente_id || !nuevaCita.odontologo) {
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
      "¿Está seguro de marcar esta cita como completada?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, completar",
          onPress: async () => {
            const resultado = await actualizarCita(id, {
              estado: "completada",
            });
            if (resultado.success) {
              cargarDatos();
              Alert.alert("Éxito", "Cita completada correctamente");
            } else {
              Alert.alert(
                "Error",
                resultado.message || "No se pudo completar la cita"
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
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Gestión de Citas</ThemedText>

        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <ThemedText style={styles.botonTexto}>
            {mostrarFormulario ? "Cancelar" : "Agendar Cita"}
          </ThemedText>
        </TouchableOpacity>

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
            <TextInput
              style={styles.input}
              placeholder="Nombre del Odontólogo"
              value={nuevaCita.odontologo}
              onChangeText={(text) =>
                setNuevaCita({ ...nuevaCita, odontologo: text })
              }
            />
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
    padding: 20,
    backgroundColor: "#f8fafb",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1e7dd",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fafcfc",
    elevation: 2,
    shadowColor: "#0066cc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 56,
    width: "100%",
    color: "#2c3e50",
    fontSize: 16,
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
  botonCancelar: {
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
  botonCompletar: {
    backgroundColor: "#28a745",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    elevation: 3,
    shadowColor: "#28a745",
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
  citaContainer: {
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
    borderLeftColor: "#4A90E2",
  },
  citaInfo: {
    marginBottom: 12,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  inputFecha: {
    borderWidth: 1,
    borderColor: "#d1e7dd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafcfc",
    elevation: 2,
    shadowColor: "#0066cc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fechaTexto: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
});
