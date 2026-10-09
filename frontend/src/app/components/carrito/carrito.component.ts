import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

declare var bootstrap: any;


@Component({
  imports: [CommonModule],
  standalone: true,
  selector: 'app-carrito',
  styleUrl: './carrito.component.css',
  templateUrl: './carrito.component.html',
})
export class CarritoComponent {
  carrito = inject(CarritoService);
  auth = inject(AuthService);            
  private router = inject(Router); 
  

  cambiar(id: number, cantidad: number) {
    this.carrito.cambiarCantidad(id, cantidad);
  }

  quitar(id: number) {
    this.carrito.quitar(id);
  }

  finalizarCompra() {
    if (this.carrito.carrito().length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'Agrega productos antes de continuar',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!this.auth.estaLogueado()) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para completar tu pedido',
        confirmButtonColor: '#dc3545',
        showCancelButton: true,
        confirmButtonText: 'Ir al login',
        cancelButtonText: 'Cancelar'
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    // Cerrar offcanvas del carrito
    const offcanvasEl = document.getElementById('carritoOffcanvas');
    if (offcanvasEl) bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();

    // Abrir modal checkout
    setTimeout(() => {
      const modalEl = document.getElementById('checkoutModal');
      if (modalEl) new bootstrap.Modal(modalEl).show();
    }, 300);
  }
}
