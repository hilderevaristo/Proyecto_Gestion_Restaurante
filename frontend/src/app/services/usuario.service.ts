import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { Direccion } from '../models/direccion';

@Service()
export class UsuarioService {
     private http = inject(HttpClient);
  private apiUrl = '/api/perfil';

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(this.apiUrl, { withCredentials: true });
  }

  actualizarDatos(nombre: string, telefono: string): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/datos`,
      { nombre, telefono },
      { withCredentials: true }
    );
  }

  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/password`,
      { passwordActual, nuevaPassword },
      { withCredentials: true }
    );
  }

  listarDirecciones(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(`${this.apiUrl}/direcciones`, { withCredentials: true });
  }

  agregarDireccion(direccion: Direccion): Observable<Direccion> {
    return this.http.post<Direccion>(`${this.apiUrl}/direcciones`, direccion, { withCredentials: true });
  }

  eliminarDireccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/direcciones/${id}`, { withCredentials: true });
  }

  marcarPredeterminada(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/direcciones/${id}/predeterminada`, {}, { withCredentials: true });
  }
}
