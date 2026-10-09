package com.example.backend.controller;

import com.example.backend.entity.Producto;
import com.example.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ProductoApiController {

    @Autowired
    private ProductoRepository productoRepository;

    // GET /api/productos  →  lista completa
    @GetMapping
    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    // GET /api/productos?categoria=Pollos  →  filtrados
    @GetMapping(params = "categoria")
    public List<Producto> listarPorCategoria(@RequestParam String categoria) {
        return productoRepository.findAll().stream()
                .filter(p -> p.getCategoria() != null && p.getCategoria().equalsIgnoreCase(categoria))
                .toList();
    }

    // GET /api/productos/{id}  →  uno solo
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/productos  →  crear
    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    // PUT /api/productos/{id}  →  actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @RequestBody Producto datos) {
        return productoRepository.findById(id).map(p -> {
            p.setNombre(datos.getNombre());
            p.setDescripcion(datos.getDescripcion());
            p.setPrecio(datos.getPrecio());
            p.setCategoria(datos.getCategoria());
            p.setImagenUrl(datos.getImagenUrl());
            return ResponseEntity.ok(productoRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/productos/{id}  →  eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}