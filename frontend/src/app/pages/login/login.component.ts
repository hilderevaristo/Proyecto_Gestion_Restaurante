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

  // 👇 Signals para los errores de validación en vivo
  errorEmail = signal<string | null>(null);
  errorPassword = signal<string | null>(null);

  // 👇 Se dispara cada vez que el usuario escribe en el email
  onEmailInput() {
    this.validarEmail();
  }

  // 👇 Se dispara cada vez que el usuario escribe en el password
  onPasswordInput() {
    this.validarPassword();
  }

  // 👇 Valida el formato del email
  private validarEmail(): boolean {
    const email = this.email.trim();

    if (email.length === 0) {
      this.errorEmail.set(null);
      return false;
    }

    // Sin @
    if (!email.includes('@')) {
      this.errorEmail.set('El correo debe contener @');
      return false;
    }

    // Con @ pero sin nada antes
    const [antes, despues] = email.split('@');
    if (!antes || antes.length === 0) {
      this.errorEmail.set('Falta el nombre antes del @');
      return false;
    }

    // Con @ pero sin dominio
    if (!despues || despues.length === 0) {
      this.errorEmail.set('Falta el dominio después del @ (ejemplo: gmail.com)');
      return false;
    }

    // Dominio sin punto
    if (!despues.includes('.')) {
      this.errorEmail.set('El dominio debe tener un punto (ejemplo: gmail.com)');
      return false;
    }

    // Formato general inválido
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      this.errorEmail.set('El correo no es válido');
      return false;
    }

    // Todo OK
    this.errorEmail.set(null);
    return true;
  }

  // 👇 Valida el password
  private validarPassword(): boolean {
    const password = this.password;

    if (password.length === 0) {
      this.errorPassword.set(null);
      return false;
    }

    if (password.length < 4) {
      this.errorPassword.set('La contraseña debe tener al menos 4 caracteres');
      return false;
    }

    // Todo OK
    this.errorPassword.set(null);
    return true;
  }

  // 👇 Se dispara al hacer clic en "Ingresar"
  login() {
    // Validar campos vacíos
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }

    // Validar formato de email
    if (!this.validarEmail()) {
      return;
    }

    // Validar password
    if (!this.validarPassword()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.cargando.set(false);

        if (res.success) {
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
          if (res.errorMsg === 'usuario_no_existe') {
            this.error.set('El correo no está registrado');
          } else if (res.errorMsg === 'contrasena_incorrecta') {
            this.error.set('Contraseña incorrecta');
          } else {
            this.error.set('Error al iniciar sesión');
          }
        }
      },
      error: (err: any) => {
        this.cargando.set(false);
        this.error.set('Error de conexión con el servidor');
        console.error('Error de login:', err);
      }
    });

  }


  // 1. Signal para controlar la visibilidad
  mostrarPassword = signal(false);

  // 2. Método para alternar
  togglePassword() {
    this.mostrarPassword.update(v => !v);
  }
}