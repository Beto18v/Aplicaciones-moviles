export interface Paciente {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  correo?: string;
}

export interface Cita {
  id: number;
  paciente_id: string;
  fecha: string;
  hora: string;
  odontologo: string;
  estado: string;
}