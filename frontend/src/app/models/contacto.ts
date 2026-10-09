export interface Contacto {
  id?: number;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string;
  fechaEnvio?: string; // ISO date string, lo pone el backend
}