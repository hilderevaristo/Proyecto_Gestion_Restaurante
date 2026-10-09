import { Direccion } from './direccion';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  fechaRegistro: string; // ISO date string
  direcciones?: Direccion[];
}