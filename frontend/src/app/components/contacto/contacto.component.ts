import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../services/contacto.service';

declare var Swal: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-contacto',
  styleUrl: './contacto.component.css',
  templateUrl: './contacto.component.html',
})
export class ContactoComponent {
   private contactoService = inject(ContactoService);

  nombre = '';
  email = '';
  telefono = '';
  mensaje = '';

  enviando = signal(false);

  enviar() {
    // Validaciones
    if (!this.nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta tu nombre',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!this.email.trim() || !this.esEmailValido(this.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Email inválido',
        text: 'Ingresa un correo válido (ejemplo@correo.com)',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!this.mensaje.trim() || this.mensaje.trim().length < 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Mensaje muy corto',
        text: 'Cuéntanos un poco más',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    this.enviando.set(true);

    const data = {
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      telefono: this.telefono.trim() || null,
      mensaje: this.mensaje.trim()
    } as any;

    this.contactoService.enviar(data).subscribe({
      next: (res) => {
        this.enviando.set(false);

        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Mensaje enviado!',
            text: 'Gracias por contactarnos. Te responderemos pronto.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Perfecto'
          });

          // Limpiar formulario
          this.nombre = '';
          this.email = '';
          this.telefono = '';
          this.mensaje = '';
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'No se pudo enviar el mensaje',
            confirmButtonColor: '#dc3545'
          });
        }
      },
      error: (err) => {
        this.enviando.set(false);
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'Intenta de nuevo en unos segundos',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Validación de teléfono opcional (solo dígitos, máx 9)
  onTelefonoInput(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 9) valor = valor.slice(0, 9);
    this.telefono = valor;
    event.target.value = valor;
  }

  private esEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
