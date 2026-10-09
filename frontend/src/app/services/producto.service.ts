import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Service()
export class ProductoService {
    private http = inject(HttpClient);
  private apiUrl = '/api/productos';

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  listarPorCategoria(categoria: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}?categoria=${categoria}`);
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crear(p: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, p);
  }

  actualizar(id: number, p: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, p);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
