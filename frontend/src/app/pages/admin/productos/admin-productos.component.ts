import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/producto';

declare var bootstrap: any;
declare var Swal: any;

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.component.html',
  styleUrl: './admin-productos.component.css'
})
export class AdminProductosComponent implements OnInit {
  private productoService = inject(ProductoService);

  productos = signal<Producto[]>([]);
  busqueda = signal('');
  cargando = signal(true);

  // Formulario NUEVO producto
  nuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    imagenUrl: ''
  };

  // Formulario EDITAR producto
  editProducto: Producto = {
    id: 0, nombre: '', descripcion: '', precio: 0, categoria: '', imagenUrl: ''
  };

  categorias = [
    'Pollos', 'Promociones', 'Piqueos', 'Hamburguesas',
    'Wraps', 'Acompañamientos', 'Postres', 'Bebidas'
  ];

  // Filtro reactivo
  productosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const lista = this.productos();
    if (!q) return lista;
    return lista.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      }
    });
  }

  getImagen(p: Producto): string {
    if (!p.imagenUrl || p.imagenUrl.trim() === '') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre)}&background=dc3545&color=fff&size=60`;
    }
    const url = p.imagenUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? url : '/' + url;
  }

  // ========== CREAR PRODUCTO ==========
  crearProducto() {
    if (!this.nuevoProducto.nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta el nombre', confirmButtonColor: '#dc3545' });
      return;
    }
    if (this.nuevoProducto.precio <= 0) {
      Swal.fire({ icon: 'warning', title: 'El precio debe ser mayor a 0', confirmButtonColor: '#dc3545' });
      return;
    }
    if (!this.nuevoProducto.categoria) {
      Swal.fire({ icon: 'warning', title: 'Selecciona una categoría', confirmButtonColor: '#dc3545' });
      return;
    }

    Swal.fire({
      title: '¿Crear producto?',
      text: '¿Estás seguro de crear este nuevo producto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.productoService.crear(this.nuevoProducto as any).subscribe({
          next: () => {
            this.cerrarModal('modalNuevoProducto');
            this.resetNuevoProducto();
            this.cargarProductos();
            Swal.fire({
              icon: 'success',
              title: '¡Creado!',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error al crear', confirmButtonColor: '#dc3545' });
          }
        });
      }
    });
  }

  resetNuevoProducto() {
    this.nuevoProducto = {
      nombre: '', descripcion: '', precio: 0, categoria: '', imagenUrl: ''
    };
  }

  // ========== EDITAR PRODUCTO ==========
  abrirEditar(p: Producto) {
    // Clonar el producto para no modificar la lista original
    this.editProducto = { ...p };

    // Abrir modal
    const modalEl = document.getElementById('modalEditarProducto');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  guardarEdicion() {
    if (!this.editProducto.nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta el nombre', confirmButtonColor: '#dc3545' });
      return;
    }
    if (this.editProducto.precio <= 0) {
      Swal.fire({ icon: 'warning', title: 'El precio debe ser mayor a 0', confirmButtonColor: '#dc3545' });
      return;
    }

    this.productoService.actualizar(this.editProducto.id, this.editProducto).subscribe({
      next: () => {
        this.cerrarModal('modalEditarProducto');
        this.cargarProductos();
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Error al actualizar', confirmButtonColor: '#dc3545' });
      }
    });
  }

  // ========== ELIMINAR PRODUCTO ==========
  eliminarProducto(p: Producto) {
    Swal.fire({
      title: '¿Eliminar producto?',
      html: `Se eliminará <strong>"${p.nombre}"</strong>.<br><small class="text-muted">Esta acción no se puede deshacer.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.productoService.eliminar(p.id).subscribe({
          next: () => {
            this.productos.update(lista => lista.filter(x => x.id !== p.id));
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error al eliminar', confirmButtonColor: '#dc3545' });
          }
        });
      }
    });
  }

  // Helper para cerrar modales de Bootstrap
  cerrarModal(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const modal = bootstrap.Modal.getInstance(el);
      if (modal) modal.hide();
    }
  }
}