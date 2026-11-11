import { Service, signal, computed } from '@angular/core';
import { ItemCarrito } from '../models/item-carrito';

@Service()
export class CarritoService {
  private items = signal<ItemCarrito[]>([]);

  readonly carrito = this.items.asReadonly();

  readonly total = computed(() =>
    this.items().reduce((s, i) => s + i.precio * i.cantidad, 0)
  );

  readonly cantidadTotal = computed(() =>
    this.items().reduce((s, i) => s + i.cantidad, 0)
  );

  // ========== CARGAR para un usuario específico ==========
  cargarParaUsuario(userId: number) {
    const key = `carrito_user_${userId}`;
    const data = localStorage.getItem(key);
    this.items.set(data ? JSON.parse(data) : []);
  }

  // ========== LIMPIAR (al cerrar sesión) ==========
  limpiar() {
    this.items.set([]);
  }

  // ========== GUARDAR (necesita el userId) ==========
  private guardarParaUsuario(userId: number | null) {
    if (userId === null) return;
    const key = `carrito_user_${userId}`;
    localStorage.setItem(key, JSON.stringify(this.items()));
  }

  // ========== MÉTODOS PÚBLICOS ==========
  agregar(item: Omit<ItemCarrito, 'cantidad'>, userId: number | null) {
    const actual = [...this.items()];
    const existe = actual.find(i => i.id === item.id);
    if (existe) {
      existe.cantidad++;
    } else {
      actual.push({ ...item, cantidad: 1 });
    }
    this.items.set(actual);
    this.guardarParaUsuario(userId);
  }

  quitar(id: number, userId: number | null) {
    this.items.set(this.items().filter(i => i.id !== id));
    this.guardarParaUsuario(userId);
  }

  cambiarCantidad(id: number, cantidad: number, userId: number | null) {
    if (cantidad <= 0) return this.quitar(id, userId);
    this.items.set(
      this.items().map(i => (i.id === id ? { ...i, cantidad } : i))
    );
    this.guardarParaUsuario(userId);
  }

  vaciar(userId: number | null) {
    this.items.set([]);
    this.guardarParaUsuario(userId);
  }
}