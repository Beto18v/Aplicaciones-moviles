import axios from "axios";

// URL del backend
let API_URL = "http://192.168.0.11/clinica";

// Log de la URL para debugging
console.log("API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Funciones para gestionar pacientes
export const obtenerPacientes = async () => {
  try {
    const { data } = await api.get("/pacientes.php");
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    return [];
  }
};

export const agregarPaciente = async (paciente) => {
  try {
    console.log("Enviando paciente:", paciente);
    const response = await api.post("/pacientes.php", paciente);
    console.log("Respuesta del servidor:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al agregar paciente:", error);
    console.error("Detalles del error:", {
      mensaje: error.message,
      respuesta: error.response?.data,
      estado: error.response?.status,
    });
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "No se pudo agregar el paciente",
    };
  }
};

export const actualizarPaciente = async (id, paciente) => {
  try {
    const { data } = await api.put(`/pacientes.php`, { ...paciente, id });
    return data;
  } catch (error) {
    console.error("Error al actualizar paciente:", error.message);
    return { success: false, message: "No se pudo actualizar el paciente" };
  }
};

export const eliminarPaciente = async (id) => {
  try {
    const { data } = await api.delete(`/pacientes.php?id=${id}`);
    return data;
  } catch (error) {
    console.error("Error al eliminar paciente:", error.message);
    return { success: false, message: "No se pudo eliminar el paciente" };
  }
};

// Funciones para gestionar citas
export const obtenerCitas = async () => {
  try {
    const { data } = await api.get("/citas.php");
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return [];
  }
};

export const agregarCita = async (cita) => {
  try {
    const { data } = await api.post("/citas.php", cita);
    return data;
  } catch (error) {
    console.error("Error al agregar cita:", error.message);
    return { success: false, message: "No se pudo agregar la cita" };
  }
};

export const actualizarCita = async (id, cita) => {
  try {
    const { data } = await api.put(`/citas.php`, { ...cita, id });
    return data;
  } catch (error) {
    console.error("Error al actualizar cita:", error.message);
    return { success: false, message: "No se pudo actualizar la cita" };
  }
};

export const cancelarCita = async (id) => {
  try {
    const { data } = await api.delete(`/citas.php?id=${id}`);
    return data;
  } catch (error) {
    console.error("Error al cancelar cita:", error.message);
    return { success: false, message: "No se pudo cancelar la cita" };
  }
};

export default {
  // Pacientes
  obtenerPacientes,
  agregarPaciente,
  actualizarPaciente,
  eliminarPaciente,
  // Citas
  obtenerCitas,
  agregarCita,
  actualizarCita,
  cancelarCita,
};
