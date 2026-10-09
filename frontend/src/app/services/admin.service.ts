import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from '../models/pedido';
import { Usuario } from '../models/usuario';

export interface DashboardData {
  totalProductos: number;
  totalUsuarios: number;
  totalOrdenes: number;
  totalIngresos: number;
  pedidosRecientes: Pedido[];
}
export interface PedidosData {
  pedidos: Pedido[];
  totalPedidos: number;
  completados: number;
  pendientes: number;
  ingresos: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}
@Service()
export class AdminService {
    private http = inject(HttpClient);
  private apiUrl = '/api/admin';

  // ========== DASHBOARD ==========
  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  // ========== PEDIDOS ==========
  getPedidos(): Observable<PedidosData> {
    return this.http.get<PedidosData>(`${this.apiUrl}/pedidos`);
  }

  cambiarEstadoPedido(id: number, estado: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/pedidos/${id}/estado`, { estado });
  }

  eliminarPedido(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/pedidos/${id}`);
  }

  // ========== USUARIOS ==========
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  eliminarUsuario(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/usuarios/${id}`);
  }
}
