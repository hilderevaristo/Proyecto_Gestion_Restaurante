import { DetallePedido } from './detalle-pedido';

export interface Pedido {
  id: number;
  usuario: any | null; // ← o `Usuario | null` si quieres tipado fuerte
  nombreCliente: string;
  telefonoCliente: string;
  direccionEntrega: string;
  metodoPago: string;
  subtotal: number;
  delivery: number;
  total: number;
  fechaPedido: string;
  estado: string;
  detalles?: DetallePedido[];
}