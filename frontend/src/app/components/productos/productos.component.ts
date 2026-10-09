import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { Producto } from '../../models/producto';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-productos',
  styleUrl: './productos.component.css',
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit{
   private productoService = inject(ProductoService);
  private carrito = inject(CarritoService);
  auth = inject(AuthService);

  productos = signal<Producto[]>([]);
  categoriaActiva = signal<string>('Todos');
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  categorias = [
    'Todos', 'Promociones', 'Pollos', 'Piqueos', 'Hamburguesas',
    'Wraps', 'Acompañamientos', 'Postres', 'Bebidas'
  ];

  productosFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    const lista = this.productos();
    return cat === 'Todos' ? lista : lista.filter(p => p.categoria === cat);
  });

  ngOnInit() {
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.error.set('No se pudieron cargar los productos');
        this.cargando.set(false);
      }
    });
  }

  filtrar(categoria: string) {
    this.categoriaActiva.set(categoria);
  }

  getImagen(p: Producto): string {
    if (!p.imagenUrl) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre)}&background=dc3545&color=fff&size=300`;
    }
    return p.imagenUrl.startsWith('http') ? p.imagenUrl : '/' + p.imagenUrl;
  }

  onImgError(event: Event, p: Producto) {
    const img = event.target as HTMLImageElement;
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre)}&background=dc3545&color=fff&size=300`;
  }

  agregarAlCarrito(p: Producto) {
    this.carrito.agregar({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      imagen: this.getImagen(p)
    });
  }
}
