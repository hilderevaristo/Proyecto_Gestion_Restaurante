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

  // 👇 Signals para validaciones en vivo
  errorNombre = signal<string | null>(null);
  errorEmail = signal<string | null>(null);
  errorTelefono = signal<string | null>(null);
  errorPassword = signal<string | null>(null);
  errorPassword2 = signal<string | null>(null);

  // 👇 Requisitos de contraseña (para mostrar en vivo)
  tieneMinimo = signal(false);
  tieneMayuscula = signal(false);
  tieneNumero = signal(false);
  tieneEspecial = signal(false);

  // ========== NOMBRE ==========
  onNombreInput() {
    const nombre = this.nombre.trim();
    if (nombre.length === 0) {
      this.errorNombre.set(null);
      return;
    }
    if (nombre.length < 3) {
      this.errorNombre.set('El nombre debe tener al menos 3 caracteres');
      return;
    }
    this.errorNombre.set(null);
  }

  // ========== EMAIL ==========
  onEmailInput() {
    const email = this.email.trim();

    if (email.length === 0) {
      this.errorEmail.set(null);
      return;
    }

    if (!email.includes('@')) {
      this.errorEmail.set('El correo debe contener @');
      return;
    }

    const [antes, despues] = email.split('@');
    if (!antes || antes.length === 0) {
      this.errorEmail.set('Falta el nombre antes del @');
      return;
    }

    if (!despues || despues.length === 0) {
      this.errorEmail.set('Falta el dominio después del @ (ejemplo: gmail.com)');
      return;
    }

    if (!despues.includes('.')) {
      this.errorEmail.set('El dominio debe tener un punto (ejemplo: gmail.com)');
      return;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      this.errorEmail.set('El correo no es válido');
      return;
    }

    this.errorEmail.set(null);
  }

  // ========== TELÉFONO ==========
  onTelefonoInput(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 9) valor = valor.slice(0, 9);
    this.telefono = valor;
    event.target.value = valor;

    if (valor.length === 0) {
      this.errorTelefono.set(null);
      return;
    }
    if (valor.length < 9) {
      this.errorTelefono.set(`Faltan ${9 - valor.length} dígitos`);
      return;
    }
    if (!valor.startsWith('9')) {
      this.errorTelefono.set('El celular debe empezar con 9');
      return;
    }
    this.errorTelefono.set(null);
  }

  // ========== PASSWORD ==========
  onPasswordInput() {
    const pwd = this.password;

    // Actualizar requisitos en vivo
    this.tieneMinimo.set(pwd.length >= 6);
    this.tieneMayuscula.set(/[A-Z]/.test(pwd));
    this.tieneNumero.set(/[0-9]/.test(pwd));
    this.tieneEspecial.set(/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pwd));

    if (pwd.length === 0) {
      this.errorPassword.set(null);
      return;
    }

    if (pwd.length < 6) {
      this.errorPassword.set('Mínimo 6 caracteres');
      return;
    }

    if (!/[A-Z]/.test(pwd)) {
      this.errorPassword.set('Debe tener al menos una mayúscula');
      return;
    }

    if (!/[0-9]/.test(pwd)) {
      this.errorPassword.set('Debe tener al menos un número');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pwd)) {
      this.errorPassword.set('Debe tener al menos un carácter especial (@, #, $, !, etc.)');
      return;
    }

    this.errorPassword.set(null);

    if (this.password2.length > 0) {
      this.onPassword2Input();
    }
  }

  // ========== CONFIRMAR PASSWORD ==========
  onPassword2Input() {
    if (this.password2.length === 0) {
      this.errorPassword2.set(null);
      return;
    }
    if (this.password !== this.password2) {
      this.errorPassword2.set('Las contraseñas no coinciden');
      return;
    }
    this.errorPassword2.set(null);
  }

  // ========== REGISTRAR ==========
  registrar() {
    this.error.set(null);

    // Validar todo
    this.onNombreInput();
    this.onEmailInput();
    this.onTelefonoInput({ target: { value: this.telefono } });
    this.onPasswordInput();
    this.onPassword2Input();

    if (this.errorNombre() || this.errorEmail() || this.errorTelefono()
      || this.errorPassword() || this.errorPassword2()) {
      this.error.set('Corrige los errores antes de continuar');
      return;
    }

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
      .set('nombre', this.nombre.trim())
      .set('email', this.email.trim())
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
  // 👇 OJITO para contraseña
  mostrarPassword = signal(false);
  togglePassword() {
    this.mostrarPassword.update(v => !v);
  }

  // 👇 OJITO para confirmar contraseña
  mostrarPassword2 = signal(false);
  togglePassword2() {
    this.mostrarPassword2.update(v => !v);
  }
}