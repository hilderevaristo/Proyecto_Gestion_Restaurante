import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

declare var Swal: any;

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true,
  selector: 'app-registro',
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  nombre = '';
  email = '';
  telefono = '';
  password = '';
  password2 = '';

  cargando = signal(false);
  error = signal<string | null>(null);

  registrar() {
    this.error.set(null);

    if (!this.nombre || !this.email || !this.telefono || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }
    if (this.password !== this.password2) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.cargando.set(true);

    const body = new HttpParams()
      .set('nombre', this.nombre)
      .set('email', this.email)
      .set('telefono', this.telefono)
      .set('password', this.password);

    this.http.post<any>('/api/auth/registro', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Cuenta creada!',
            text: 'Ahora puedes iniciar sesión',
            timer: 1800,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/login']));
        } else if (res.errorMsg === 'email_ya_registrado') {
          this.error.set('Ese correo ya está registrado');
        } else {
          this.error.set('Error al registrar');
        }
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Error de conexión');
      }
    });
  }
}
