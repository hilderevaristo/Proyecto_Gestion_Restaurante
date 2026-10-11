import { inject, Service, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario';

interface LoginResponse {
    success: boolean;
    token?: string;       // 👈 Token JWT
    nombre?: string;
    rol?: string;
    email?: string;
    id?: number;
    errorMsg?: string;
}

@Service()
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = '/api/auth';

    usuarioActual = signal<Usuario | null>(this.cargarDeStorage());

    // ========== LOGIN ==========
    login(email: string, password: string): Observable<LoginResponse> {
        const body = new HttpParams()
            .set('email', email)
            .set('password', password);

        return this.http.post<LoginResponse>(
            `${this.apiUrl}/login`,
            body.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        ).pipe(
            tap(res => {
                if (res.success && res.token) {
                    // 👇 Guardar TOKEN
                    localStorage.setItem('token', res.token);

                    // 👇 Guardar datos del usuario
                    const usuario: Usuario = {
                        id: res.id ?? 0,
                        nombre: res.nombre ?? '',
                        email: res.email ?? email,
                        telefono: '',
                        rol: res.rol ?? 'USER',
                        fechaRegistro: new Date().toISOString()
                    };
                    this.usuarioActual.set(usuario);
                    localStorage.setItem('usuario', JSON.stringify(usuario));
                }
            })
        );
    }

    // ========== LOGOUT ==========
    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
            tap(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                this.usuarioActual.set(null);
            })
        );
    }

    // ========== HELPERS ==========
    estaLogueado(): boolean {
        return this.usuarioActual() !== null && this.getToken() !== null;
    }

    esAdmin(): boolean {
        const u = this.usuarioActual();
        return u?.rol === 'ADMIN';
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private cargarDeStorage(): Usuario | null {
        const data = localStorage.getItem('usuario');
        return data ? JSON.parse(data) : null;
    }
}