package com.example.backend.controller;

import com.example.backend.entity.Pedido;
import com.example.backend.entity.Usuario;
import com.example.backend.repository.DetallePedidoRepository;
import com.example.backend.repository.DireccionRepository;
import com.example.backend.repository.PedidoRepository;
import com.example.backend.repository.ProductoRepository;
import com.example.backend.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AdminApiController {

    @Autowired private PedidoRepository pedidoRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
     @Autowired private DetallePedidoRepository detallePedidoRepository;   // 👈 NUEVO
    @Autowired private DireccionRepository direccionRepository; 

    // ⚠️ YA NO USAMOS HttpSession
    // Spring Security verifica el rol ADMIN en SecurityConfig
    // (todas las rutas /api/admin/** requieren ROLE_ADMIN)
    // Si el token no es válido o no tiene ROLE_ADMIN → 403 automático

    // ========== DASHBOARD ==========
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> response = new HashMap<>();
        List<Pedido> todos = pedidoRepository.findAll();

        long totalProductos = productoRepository.count();
        long totalUsuarios = usuarioRepository.count();
        long totalOrdenes = todos.size();

        double totalIngresos = todos.stream()
                .filter(p -> p.getEstado() == null || !"CANCELADO".equalsIgnoreCase(p.getEstado()))
                .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                .sum();

        List<Pedido> recientes = todos.size() > 5
                ? todos.subList(todos.size() - 5, todos.size())
                : todos;

        response.put("totalProductos", totalProductos);
        response.put("totalUsuarios", totalUsuarios);
        response.put("totalOrdenes", totalOrdenes);
        response.put("totalIngresos", totalIngresos);
        response.put("pedidosRecientes", recientes);
        return ResponseEntity.ok(response);
    }

    // ========== PEDIDOS ==========
    @GetMapping("/pedidos")
    public ResponseEntity<Map<String, Object>> listarPedidos() {
        Map<String, Object> response = new HashMap<>();
        List<Pedido> pedidos = pedidoRepository.findAll();

        // Forzar carga de detalles lazy
        for (Pedido p : pedidos) {
            if (p.getDetalles() != null) p.getDetalles().size();
        }

        long totalPedidos = pedidos.size();
        long completados = pedidos.stream()
                .filter(p -> "COMPLETADO".equalsIgnoreCase(p.getEstado()))
                .count();
        long pendientes = pedidos.stream()
                .filter(p -> "PENDIENTE".equalsIgnoreCase(p.getEstado()))
                .count();
        double ingresos = pedidos.stream()
                .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                .sum();

        response.put("pedidos", pedidos);
        response.put("totalPedidos", totalPedidos);
        response.put("completados", completados);
        response.put("pendientes", pendientes);
        response.put("ingresos", ingresos);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/pedidos/{id}/estado")
    public ResponseEntity<Map<String, Object>> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        Pedido pedido = pedidoRepository.findById(id).orElse(null);

        if (pedido == null) {
            response.put("success", false);
            response.put("message", "Pedido no encontrado");
            return ResponseEntity.ok(response);
        }

        pedido.setEstado(body.get("estado").toUpperCase());
        pedidoRepository.save(pedido);
        response.put("success", true);
        response.put("message", "Estado actualizado");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/pedidos/{id}")
    public ResponseEntity<Map<String, Object>> eliminarPedido(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        if (!pedidoRepository.existsById(id)) {
            response.put("success", false);
            response.put("message", "Pedido no encontrado");
            return ResponseEntity.ok(response);
        }
        pedidoRepository.deleteById(id);
        response.put("success", true);
        response.put("message", "Pedido eliminado");
        return ResponseEntity.ok(response);
    }

    // ========== USUARIOS ==========
   // ========== USUARIOS ==========
    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        usuarios.removeIf(u -> "ADMIN".equalsIgnoreCase(u.getRol()));
        return ResponseEntity.ok(usuarios);
    }

    @DeleteMapping("/usuarios/{id}")
    @Transactional   // 👈 IMPORTANTE
    public ResponseEntity<Map<String, Object>> eliminarUsuario(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        Usuario user = usuarioRepository.findById(id).orElse(null);

        if (user == null) {
            response.put("success", false);
            response.put("message", "Usuario no encontrado");
            return ResponseEntity.ok(response);
        }

        if ("ADMIN".equalsIgnoreCase(user.getRol())) {
            response.put("success", false);
            response.put("message", "No puedes eliminar a un administrador");
            return ResponseEntity.ok(response);
        }

        try {
            // 1. Borrar pedidos del usuario (y sus detalles)
            List<Pedido> pedidos = pedidoRepository.findAll();
            for (Pedido p : pedidos) {
                if (p.getUsuario() != null && p.getUsuario().getId().equals(id)) {
                    // Borrar detalles del pedido
                    if (p.getDetalles() != null && !p.getDetalles().isEmpty()) {
                        detallePedidoRepository.deleteAll(p.getDetalles());
                    }
                    // Borrar el pedido
                    pedidoRepository.delete(p);
                }
            }

            // 2. Borrar direcciones del usuario
            direccionRepository.deleteAll(
                direccionRepository.findAll().stream()
                    .filter(d -> d.getUsuario() != null && d.getUsuario().getId().equals(id))
                    .toList()
            );

            // 3. Borrar el usuario
            usuarioRepository.delete(user);

            response.put("success", true);
            response.put("message", "Usuario eliminado junto con sus pedidos y direcciones");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error al eliminar: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}