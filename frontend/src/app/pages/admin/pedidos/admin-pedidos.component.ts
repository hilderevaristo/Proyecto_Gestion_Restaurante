import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, PedidosData } from '../../../services/admin.service';
import { Pedido } from '../../../models/pedido';

declare var bootstrap: any;
declare var Swal: any;

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.css'
})
export class AdminPedidosComponent implements OnInit {
  private adminService = inject(AdminService);

  pedidos = signal<Pedido[]>([]);
  stats = signal<PedidosData | null>(null);
  busqueda = signal('');
  filtroEstado = signal<string>('todos');
  cargando = signal(true);
  pedidosExpandidos = signal<Set<number>>(new Set());

  // Estado para el modal
  pedidoSeleccionado: Pedido | null = null;

  estados = [
    { valor: 'pendiente', label: 'Pendiente', color: '#FFA500' },
    { valor: 'procesando', label: 'Procesando', color: '#FFD700' },
    { valor: 'enviado', label: 'Enviado', color: '#1E90FF' },
    { valor: 'completado', label: 'Completado', color: '#28A745' },
    { valor: 'cancelado', label: 'Cancelado', color: '#DC3545' }
  ];

  // Filtro reactivo
  pedidosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();
    let lista = this.pedidos();

    // Filtrar por estado
    if (estado !== 'todos') {
      lista = lista.filter(p => p.estado?.toLowerCase() === estado.toLowerCase());
    }

    // Filtrar por búsqueda
    if (q) {
      lista = lista.filter(p =>
        p.nombreCliente?.toLowerCase().includes(q) ||
        p.telefonoCliente?.toLowerCase().includes(q) ||
        p.direccionEntrega?.toLowerCase().includes(q) ||
        `ord-${p.id}`.includes(q)
      );
    }

    return lista;
  });

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.adminService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(data.pedidos || []);
        this.stats.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      }
    });
  }

  // ========== EXPANDIR/COLAPSAR ==========
  toggleDetalle(id: number) {
    const set = new Set(this.pedidosExpandidos());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.pedidosExpandidos.set(set);
  }

  estaExpandido(id: number): boolean {
    return this.pedidosExpandidos().has(id);
  }

  // ========== CAMBIAR ESTADO ==========
  abrirModalEstado(p: Pedido) {
    this.pedidoSeleccionado = p;
    const modalEl = document.getElementById('modalCambiarEstado');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  cambiarEstado(nuevoEstado: string) {
    if (!this.pedidoSeleccionado) return;

    this.adminService.cambiarEstadoPedido(this.pedidoSeleccionado.id, nuevoEstado).subscribe({
      next: (res) => {
        if (res.success) {
          // Cerrar modal
          const modalEl = document.getElementById('modalCambiarEstado');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
          }

          // Actualizar localmente
          this.pedidos.update(lista =>
            lista.map(p => p.id === this.pedidoSeleccionado!.id
              ? { ...p, estado: nuevoEstado.toUpperCase() }
              : p
            )
          );

          // Actualizar stats
          this.cargarPedidos();

          Swal.fire({
            icon: 'success',
            title: '¡Estado actualizado!',
            timer: 1200,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'No se pudo actualizar',
            confirmButtonColor: '#dc3545'
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // ========== ELIMINAR ==========
  eliminarPedido(p: Pedido) {
    Swal.fire({
      title: '¿Eliminar orden?',
      html: `Estás a punto de eliminar la orden de <strong>${p.nombreCliente}</strong>.<br>
             <span class="text-danger fw-bold">¡Esta acción no se puede deshacer!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.adminService.eliminarPedido(p.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.pedidos.update(lista => lista.filter(x => x.id !== p.id));
              this.cargarPedidos();
              Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                timer: 1200,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.message,
                confirmButtonColor: '#dc3545'
              });
            }
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error de conexión',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  // ========== HELPERS ==========
  getBadgeClass(estado: string | undefined): string {
    if (!estado) return 'bg-secondary';
    switch (estado.toUpperCase()) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'PROCESANDO': return 'bg-info text-dark';
      case 'ENVIADO': return 'bg-primary';
      case 'COMPLETADO': return 'bg-success';
      case 'CANCELADO': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getEstadoLabel(estado: string | undefined): string {
    if (!estado) return '';
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  }
}