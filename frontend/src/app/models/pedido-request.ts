import { ItemRequest } from './item-request';

export interface PedidoRequest {
   nombreCliente: string;
  telefonoCliente: string;
  direccionCliente: string;
  metodoPago: string;
  tipoEntrega: string;      // "Delivery" o "Recojo"
  items: ItemRequest[];
}