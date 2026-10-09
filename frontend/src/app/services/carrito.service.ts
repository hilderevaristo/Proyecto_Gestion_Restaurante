import { computed, Service, signal } from '@angular/core';
import { ItemCarrito } from '../models/item-carrito';

@Service()
export class CarritoService {
     private items = signal<ItemCarrito[]>(this.cargarDeStorage());

  readonly carrito = this.items.asReadonly();

  readonly total = computed(() =>
    this.items().reduce((s, i) => s + i.precio * i.cantidad, 0)
  );

  readonly cantidadTotal = computed(() =>
    this.items().reduce((s, i) => s + i.cantidad, 0)
  );

  agregar(item: Omit<ItemCarrito, 'cantidad'>) {
    const actual = [...this.items()];
    const existe = actual.find(i => i.id === item.id);
    if (existe) {
      existe.cantidad++;
    } else {
      actual.push({ ...item, cantidad: 1 });
    }
    this.items.set(actual);
    this.guardarEnStorage();
  }

  quitar(id: number) {
    this.items.set(this.items().filter(i => i.id !== id));
    this.guardarEnStorage();
  }

  cambiarCantidad(id: number, cantidad: number) {
    if (cantidad <= 0) return this.quitar(id);
    this.items.set(
      this.items().map(i => (i.id === id ? { ...i, cantidad } : i))
    );
    this.guardarEnStorage();
  }

  vaciar() {
    this.items.set([]);
    this.guardarEnStorage();
  }

  private guardarEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.items()));
  }

  private cargarDeStorage(): ItemCarrito[] {
    const data = localStorage.getItem('carrito');
    return data ? JSON.parse(data) : [];
  }
}
