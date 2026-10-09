import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  auth = inject(AuthService);
  carrito = inject(CarritoService);

  // Signal que dice si estamos scrolleados
  scrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled.set(window.scrollY > 50);
  }

  confirmarCerrarSesion() {
    const modal = new bootstrap.Modal(document.getElementById('modalCerrarSesion'));
    modal.show();
  }

  cerrarSesion() {
    this.auth.logout().subscribe({
      next: () => {
        bootstrap.Modal.getInstance(document.getElementById('modalCerrarSesion'))?.hide();
        window.location.href = '/';
      },
      error: () => {
        this.auth.usuarioActual.set(null);
        localStorage.removeItem('usuario');
        window.location.href = '/';
      }
    });
  }

  mostrarCarrito() {
    const el = document.getElementById('carritoOffcanvas');
    if (el) new bootstrap.Offcanvas(el).show();
  }
}