import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequest } from '../models/pedido-request';

export interface PedidoResponse {
  success: boolean;
  message?: string;
  pedidoId?: number;
  total?: number;
}

@Service()
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/pedidos';

  guardar(pedido: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/guardar`, pedido);
  }
}
