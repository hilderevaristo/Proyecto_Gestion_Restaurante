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

  tipoEntrega = 'Delivery';
  metodoPago = 'Efectivo';
  numeroOperacion = '';

  procesando = signal(false);

  // Datos fijos
  COSTO_DELIVERY = 5.0;
  YAPE_NUMERO = '+51 985 660 797';
  YAPE_TITULAR = 'Victor DonVictor';
  BCP_CUENTA = '123-4567890-0-12';
  BCP_CCI = '002-123-456789012345-12';
  BCP_TITULAR = 'Victor DonVictor';

  // 👇 Número de WhatsApp del negocio (sin +)
  WHATSAPP_NEGOCIO = '51928451637';

  get subtotal(): number {
    return this.carrito.total();
  }

  get costoDelivery(): number {
    return this.tipoEntrega === 'Delivery' ? this.COSTO_DELIVERY : 0;
  }

  get totalFinal(): number {
    return this.subtotal + this.costoDelivery;
  }

  setTipoEntrega(tipo: string) {
    this.tipoEntrega = tipo;
    if (tipo === 'Recojo') {
      this.direccionCliente = 'Recojo en el local';
    } else if (this.direccionCliente === 'Recojo en el local') {
      this.direccionCliente = '';
    }
  }

  setMetodoPago(metodo: string) {
    this.metodoPago = metodo;
    this.numeroOperacion = '';
  }

  onTelefonoInput(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 9) valor = valor.slice(0, 9);
    this.telefonoCliente = valor;
    event.target.value = valor;
  }

  private validarFormulario(): string | null {
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

  // ========== CONFIRMAR PEDIDO ==========
  confirmarPedido() {
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

    // 👇 Guardar los items ANTES de vaciar el carrito
    const itemsGuardados = [...this.carrito.carrito()];

    this.procesando.set(true);

    this.pedidoService.guardar(request).subscribe({
      next: (res) => {
        this.procesando.set(false);

        if (res.success) {
          // Cerrar modal y offcanvas
          const modalEl = document.getElementById('checkoutModal');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

          const offcanvasEl = document.getElementById('carritoOffcanvas');
          if (offcanvasEl) bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();

          // 👇 Guardar datos para el WhatsApp ANTES de vaciar el carrito
          const pedidoId = res.pedidoId!;
          const totalFinal = res.total!;
          const datosParaWA = this.construirMensajeWA(pedidoId, totalFinal, itemsGuardados);

          // Vaciar carrito
          this.carrito.vaciar();

          // 👇 Modal de éxito CON botón de WhatsApp
          Swal.fire({
            icon: 'success',
            title: '¡Pedido confirmado!',
            html: `
              <p class="mb-1">Pedido <strong>#${pedidoId}</strong> registrado.</p>
              <p class="mb-3"><strong>Total: S/ ${totalFinal.toFixed(2)}</strong></p>
              <p class="text-muted small mb-0">
                <i class="fab fa-whatsapp text-success"></i>
                Envíanos tu pedido por WhatsApp para confirmarlo
              </p>
            `,
            confirmButtonColor: '#25D366',
            confirmButtonText: '<i class="fab fa-whatsapp me-2"></i>Enviar por WhatsApp',
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            cancelButtonColor: '#6c757d',
            allowOutsideClick: false,
          }).then((result: any) => {
            if (result.isConfirmed) {
              // Abrir WhatsApp con el mensaje
              const url = `https://wa.me/${this.WHATSAPP_NEGOCIO}?text=${encodeURIComponent(datosParaWA)}`;
              window.open(url, '_blank');
            }
            // Ir al home después
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 500);
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

  // ========== CONSTRUIR MENSAJE WHATSAPP ==========
  private construirMensajeWA(pedidoId: number, total: number, items: any[]): string {
    let mensaje = `Hola DonVictor 👋\n`;
    mensaje += `Quiero confirmar mi pedido *#${pedidoId}*:\n\n`;

    // Productos
    items.forEach((item: any) => {
      const subtotalItem = (item.precio * item.cantidad).toFixed(2);
      mensaje += `• ${item.cantidad}x ${item.nombre} — S/ ${subtotalItem}\n`;
    });

    mensaje += `\n`;
    mensaje += `Subtotal: S/ ${this.subtotal.toFixed(2)}\n`;
    if (this.costoDelivery > 0) {
      mensaje += `Delivery: S/ ${this.costoDelivery.toFixed(2)}\n`;
    }
    mensaje += `*TOTAL: S/ ${total.toFixed(2)}*\n\n`;

    // Datos del cliente
    mensaje += `*Datos de contacto:*\n`;
    mensaje += `👤 ${this.nombreCliente}\n`;
    mensaje += `📞 ${this.telefonoCliente}\n`;
    mensaje += `📍 ${this.tipoEntrega === 'Recojo' ? 'Recojo en el local' : this.direccionCliente}\n`;
    mensaje += `💳 ${this.metodoPago}\n`;

    if (this.metodoPago === 'Yape' && this.numeroOperacion) {
      mensaje += `🔢 N° Operación: ${this.numeroOperacion}\n`;
    }

    return mensaje;
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