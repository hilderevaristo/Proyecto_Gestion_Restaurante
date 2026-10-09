import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Usuario } from '../../../models/usuario';

declare var Swal: any;

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {
  private adminService = inject(AdminService);

  usuarios = signal<Usuario[]>([]);
  busqueda = signal('');
  cargando = signal(true);

  // Filtrado reactivo con computed
  usuariosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const lista = this.usuarios();

    if (!q) return lista;

    return lista.filter(u =>
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando.set(true);
    this.adminService.getUsuarios().subscribe({
      next: (data) => {
        // 👇 Filtrar usuarios ADMIN (no mostrar administradores)
        const soloClientes = data.filter(u => u.rol !== 'ADMIN');
        this.usuarios.set(soloClientes);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      }
    });
  }

  eliminarUsuario(user: Usuario) {
    Swal.fire({
      title: '¿Estás seguro?',
      html: `El usuario <strong>"${user.nombre}"</strong> será eliminado permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.adminService.eliminarUsuario(user.id).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Usuario eliminado correctamente',
                timer: 1500,
                showConfirmButton: false
              });
              // Actualizar la lista sin recargar
              this.usuarios.update(lista => lista.filter(u => u.id !== user.id));
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.message || 'No se pudo eliminar',
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

  getInicial(nombre: string | undefined): string {
    if (!nombre || nombre.length === 0) return 'U';
    return nombre.charAt(0).toUpperCase();
  }

  // Colores variados según el nombre
  getColorAvatar(nombre: string | undefined): string {
    const colores = ['#0d6efd', '#6f42c1', '#d63384', '#fd7e14', '#20c997', '#0dcaf0'];
    if (!nombre) return colores[0];
    const index = nombre.charCodeAt(0) % colores.length;
    return colores[index];
  }
}