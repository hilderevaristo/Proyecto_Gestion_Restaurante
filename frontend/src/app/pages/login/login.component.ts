import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var Swal: any;

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  recordarme = false;
  cargando = signal(false);
  error = signal<string | null>(null);

  login() {
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.login(this.email, this.password).subscribe({
      // ✅ RESPUESTA EXITOSA (con o sin error del backend)
      next: (res) => {
        this.cargando.set(false);

        if (res.success) {
          // Login correcto
          Swal.fire({
            icon: 'success',
            title: `¡Bienvenido, ${res.nombre}!`,
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            if (res.rol === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          });
        } else {
          // 👇 Aquí está la clave: manejar errorMsg del backend
          if (res.errorMsg === 'usuario_no_existe') {
            this.error.set('El correo no está registrado');
          } else if (res.errorMsg === 'contrasena_incorrecta') {
            this.error.set('Contraseña incorrecta');
          } else {
            this.error.set('Error al iniciar sesión');
          }
        }
      },

      // ✅ ERROR DE RED (backend apagado, timeout, etc.)
      error: (err: any) => {
        this.cargando.set(false);
        this.error.set('Error de conexión con el servidor');
        console.error('Error de login:', err);
      }
    });
  }
}