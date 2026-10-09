import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { PedidoRequest } from '../../models/pedido-request';

declare var bootstrap: any;
declare var Swal: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-checkout',
  styleUrl: './checkout.component.css',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  carrito = inject(CarritoService);
  private pedidoService = inject(PedidoService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Datos del formulario
  nombreCliente = this.auth.usuarioActual()?.nombre || '';
  telefonoCliente = '';
  direccionCliente = '';
  referencia = '';

  tipoEntrega = 'Delivery';      // Delivery | Recojo
  metodoPago = 'Efectivo';        // Efectivo | Yape | Transferencia
  numeroOperacion = '';

  // UI
  procesando = signal(false);

  // Datos fijos (ajusta si cambian)
  COSTO_DELIVERY = 5.0;
  YAPE_NUMERO = '+51 985 660 797';
  YAPE_TITULAR = 'Victor DonVictor';
  BCP_CUENTA = '123-4567890-0-12';
  BCP_CCI = '002-123-456789012345-12';
  BCP_TITULAR = 'Victor DonVictor';

  // Total dinámico
  get subtotal(): number {
    return this.carrito.total();
  }

  get costoDelivery(): number {
    return this.tipoEntrega === 'Delivery' ? this.COSTO_DELIVERY : 0;
  }

  get totalFinal(): number {
    return this.subtotal + this.costoDelivery;
  }

  // Cambiar tipo de entrega
  setTipoEntrega(tipo: string) {
    this.tipoEntrega = tipo;
    if (tipo === 'Recojo') {
      this.direccionCliente = 'Recojo en el local';
    } else if (this.direccionCliente === 'Recojo en el local') {
      this.direccionCliente = '';
    }
  }

  // Cambiar método de pago
  setMetodoPago(metodo: string) {
    this.metodoPago = metodo;
    this.numeroOperacion = '';
  }

// ========== SANITIZAR TELÉFONO (solo dígitos, máx 9) ==========
onTelefonoInput(event: any) {
  let valor = event.target.value.replace(/\D/g, ''); // solo números
  if (valor.length > 9) valor = valor.slice(0, 9);   // máx 9
  this.telefonoCliente = valor;
  event.target.value = valor;
}

// ========== VALIDACIONES ==========
private validarFormulario(): string | null {
  // Teléfono
  if (!this.telefonoCliente.trim()) {
    return 'Por favor, ingresa tu teléfono';
  }
  if (!/^\d{9}$/.test(this.telefonoCliente)) {
    return 'El teléfono debe tener exactamente 9 dígitos';
  }
  if (!this.telefonoCliente.startsWith('9')) {
    return 'El teléfono debe empezar con 9 (celular peruano)';
  }
  return null;
}

  // Confirmar pedido
  confirmarPedido() {
  // Validar
  const errorValidacion = this.validarFormulario();
  if (errorValidacion) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: errorValidacion,
      confirmButtonColor: '#dc3545'
    });
    return;
  }

  // Construir request
  const request: PedidoRequest = {
    nombreCliente: this.nombreCliente.trim(),
    telefonoCliente: this.telefonoCliente,
    direccionCliente: this.tipoEntrega === 'Recojo'
      ? 'Recojo en el local'
      : this.direccionCliente.trim(),
    metodoPago: this.metodoPago,
    tipoEntrega: this.tipoEntrega,
    items: this.carrito.carrito().map(i => ({
      productoId: i.id,
      cantidad: i.cantidad,
      precioUnitario: i.precio
    }))
  };

  this.procesando.set(true);

  this.pedidoService.guardar(request).subscribe({
    next: (res) => {
      this.procesando.set(false);

      if (res.success) {
        const modalEl = document.getElementById('checkoutModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

        const offcanvasEl = document.getElementById('carritoOffcanvas');
        if (offcanvasEl) bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();

        this.carrito.vaciar();

        Swal.fire({
          icon: 'success',
          title: '¡Pedido confirmado!',
          html: `
            <p>Tu pedido <strong>#${res.pedidoId}</strong> fue recibido.</p>
            <p class="mb-0"><strong>Total: S/ ${res.total?.toFixed(2)}</strong></p>
            <small class="text-muted">Te contactaremos pronto 🛵</small>
          `,
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Perfecto'
        }).then(() => {
          this.router.navigate(['/']);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message || 'No se pudo procesar el pedido',
          confirmButtonColor: '#dc3545'
        });
      }
    },
    error: (err) => {
      this.procesando.set(false);
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
  volverAlCarrito() {
    const modalEl = document.getElementById('checkoutModal');
    if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

    setTimeout(() => {
      const offcanvasEl = document.getElementById('carritoOffcanvas');
      if (offcanvasEl) new bootstrap.Offcanvas(offcanvasEl).show();
    }, 300);
  }
}
