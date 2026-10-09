package com.example.backend.entity;


public class ItemCarrito {

    private Producto producto;
    private Integer cantidad;

    // Constructor vacío
    public ItemCarrito() {}

    // Constructor con parámetros
    public ItemCarrito(Producto producto, Integer cantidad) {
        this.producto = producto;
        this.cantidad = cantidad;
    }

    // Getters y Setters
    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    // Métodos de utilidad
    public Double getPrecio() {
        return producto != null ? producto.getPrecio() : 0.0;
    }

    public Double getSubtotal() {
        return getPrecio() * cantidad;
    }

    @Override
    public String toString() {
        return "ItemCarrito{" +
                "producto=" + (producto != null ? producto.getNombre() : "null") +
                ", cantidad=" + cantidad +
                ", subtotal=" + getSubtotal() +
                '}';
    }
}