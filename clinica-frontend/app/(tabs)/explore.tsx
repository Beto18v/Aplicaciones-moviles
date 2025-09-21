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
import { Picker } from "@react-native-picker/picker";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Paciente, Cita } from "../types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  obtenerCitas,
  agregarCita,
  cancelarCita,
  obtenerPacientes,
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
        style: "destructive",
        onPress: async () => {
          const resultado = await cancelarCita(id);
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
          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => handleCancelarCita(item.id)}
          >
            <ThemedText style={styles.botonTexto}>Cancelar</ThemedText>
          </TouchableOpacity>
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
            <TextInput
              style={styles.input}
              placeholder="Fecha (YYYY-MM-DD)"
              value={nuevaCita.fecha}
              onChangeText={(text) =>
                setNuevaCita({ ...nuevaCita, fecha: text })
              }
            />
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
    padding: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  headerImage: {
    width: 200,
    height: 200,
    position: "absolute",
    bottom: -50,
    right: -50,
    opacity: 0.5,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  botonCancelar: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  lista: {
    flex: 1,
  },
  citaContainer: {
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
  citaInfo: {
    marginBottom: 8,
  },
});
