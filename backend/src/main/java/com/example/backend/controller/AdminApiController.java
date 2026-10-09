package com.example.backend.controller;

import com.example.backend.entity.Pedido;
import com.example.backend.entity.Usuario;
import com.example.backend.repository.PedidoRepository;
import com.example.backend.repository.ProductoRepository;
import com.example.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    // ========== VERIFICAR QUE SEA ADMIN ==========
    private boolean esAdmin(HttpSession session) {
        Usuario u = (Usuario) session.getAttribute("usuario");
        return u != null && "ADMIN".equalsIgnoreCase(u.getRol());
    }

    private ResponseEntity<Map<String, Object>> noAutorizado() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "No autorizado");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // ========== DASHBOARD ==========
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(HttpSession session) {
        if (!esAdmin(session)) return noAutorizado();

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
    public ResponseEntity<?> listarPedidos(HttpSession session) {
        if (!esAdmin(session)) return noAutorizado();

        Map<String, Object> response = new HashMap<>();
        List<Pedido> pedidos = pedidoRepository.findAll();

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
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpSession session) {
        if (!esAdmin(session)) return noAutorizado();

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
    public ResponseEntity<?> eliminarPedido(@PathVariable Long id, HttpSession session) {
        if (!esAdmin(session)) return noAutorizado();

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
    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(HttpSession session) {
        if (!esAdmin(session)) return noAutorizado();

        // Excluir admins de la lista de clientes
        List<Usuario> usuarios = usuarioRepository.findAll();
        usuarios.removeIf(u -> "ADMIN".equalsIgnoreCase(u.getRol()));
        return ResponseEntity.ok(usuarios);
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id, HttpSession session) {
        if (!esAdmin(session)) return noAutorizado();

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

        usuarioRepository.delete(user);
        response.put("success", true);
        response.put("message", "Usuario eliminado");
        return ResponseEntity.ok(response);
    }
}