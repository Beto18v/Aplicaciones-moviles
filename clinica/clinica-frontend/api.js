import axios from "axios";
import Constants from "expo-constants";

// Backup por defecto

// IP de la pc y nombre de la carpeta del proyecto
let API_URL = "http://10.115.68.16/Nicolas/Proyecto-tareas";

//Se valida la conexion con el debugger de Expo
try {
    // Para Expo SDK nuevo
    const debuggerHost = 
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.expoConfig?.hostUri ||
        Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(":").shift();
        API_URL = `http://${ip}/proyecto-tareas`;
    }
} catch (e) {
    // No hacer nada si falla
    console.log("No se pudo obtener la IP del debugger");
}

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const obtenerTareas = async () => {
    try {
        const { data } = await api.get("/listar_tareas.php");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        return [];
    }
};

export const agregarTarea = async (titulo) => {
    try {
        const { data } = await api.post("/crear_tarea.php", { titulo });
        return data;
    } catch (error) {
        console.error("Error al agregar tarea:", error.message);
        return { success: false, message: "No se pudo agregar la tarea"};
    }
};

export const eliminarTarea = async (id) => {
    try {
        const { data } = await api.post("/eliminar_tarea.php", { id });
        return data;
    } catch (error) {
        console.error("Error al eliminar tarea:", error.message);
        return { success: false, message: "No se pudo eliminar la tarea" };
    }
};

export const cambiarEstado = async (id, estadoActual) => {
    try {
        const { data } = await api.post("/cambiar_estado.php", { 
            id,
            estado: estadoActual,
        });
        return data;
    } catch (error) {
        console.error("Error al cambiar estado de la tarea:", error.message);
        return { success: false, message: "No se pudo cambiar el estado de la tarea" };
    }
};

export default {
    obtenerTareas,
    agregarTarea,
    eliminarTarea,
    cambiarEstado,
}