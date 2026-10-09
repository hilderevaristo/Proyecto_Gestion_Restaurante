export interface Direccion {
  id: number;
  alias: string;
  direccionExacta: string;
  referencia: string | null;
  esPredeterminada: boolean;
}