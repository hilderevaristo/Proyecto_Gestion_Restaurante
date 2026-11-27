
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Usuario } from '../models/usuario';
import { CarritoService } from './carrito.service';

interface LoginResponse {
    success: boolean;
    token?: string;
    nombre?: string;
    rol?: string;
    email?: string;
    id?: number;
    errorMsg?: string;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private carrito = inject(CarritoService);
    private apiUrl = '/api/auth';

    usuarioActual = signal<Usuario | null>(this.cargarDeStorage());

    constructor() {
        const usuario = this.usuarioActual();

        if (usuario) {
            this.carrito.cargarParaUsuario(usuario.id);
        }
    }

    // ========== LOGIN ==========
    login(email: string, password: string): Observable<LoginResponse> {
        const body = new HttpParams()
            .set('email', email)
            .set('password', password);

        return this.http.post<LoginResponse | null>(
            `${this.apiUrl}/login`,
            body.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).pipe(
            map(res => {
                if (!res || typeof res !== 'object') {
                    throw new Error('El servidor devolvió una respuesta vacía');
                }

                return res;
            }),

            tap(res => {
                if (res.success === true && res.token) {
                    localStorage.setItem('token', res.token);

                    const usuario: Usuario = {
                        id: res.id ?? 0,
                        nombre: res.nombre ?? '',
                        email: res.email ?? email,
                        telefono: '',
                        rol: res.rol ?? 'USER',
                        fechaRegistro: new Date().toISOString()
                    };

                    this.usuarioActual.set(usuario);

                    localStorage.setItem(
                        'usuario',
                        JSON.stringify(usuario)
                    );

                    this.carrito.cargarParaUsuario(usuario.id);
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
                this.carrito.limpiar();
            })
        );
    }

    // ========== HELPERS ==========
    estaLogueado(): boolean {
        return this.usuarioActual() !== null &&
            this.getToken() !== null;
    }

    esAdmin(): boolean {
        const u = this.usuarioActual();
        return u?.rol === 'ADMIN';
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private cargarDeStorage(): Usuario | null {
        try {
            const data = localStorage.getItem('usuario');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }
}
