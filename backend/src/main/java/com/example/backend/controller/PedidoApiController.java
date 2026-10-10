package com.example.backend.controller;

import com.example.backend.dto.PedidoRequest;
import com.example.backend.dto.ItemRequest;
import com.example.backend.entity.Pedido;
import com.example.backend.entity.DetallePedido;
import com.example.backend.entity.Producto;
import com.example.backend.entity.Usuario;                             // 👈 NUEVO
import com.example.backend.repository.PedidoRepository;
import com.example.backend.repository.DetallePedidoRepository;
import com.example.backend.repository.ProductoRepository;
import jakarta.servlet.http.HttpSession;                              // 👈 NUEVO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class PedidoApiController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // 👇 AGREGAR HttpSession session como parámetro
    @PostMapping("/guardar")
    public ResponseEntity<Map<String, Object>> guardarPedido(
            @RequestBody PedidoRequest request,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 👇 1. Obtener el usuario de la sesión
            Usuario usuario = (Usuario) session.getAttribute("usuario");

            // 2. Crear el Pedido
            Pedido pedido = new Pedido();
            pedido.setUsuario(usuario);                            // 👈 ASIGNAR
            pedido.setNombreCliente(request.getNombreCliente());
            pedido.setTelefonoCliente(request.getTelefonoCliente());
            pedido.setDireccionEntrega(request.getDireccionCliente());
            pedido.setMetodoPago(request.getMetodoPago());
            pedido.setFechaPedido(LocalDateTime.now());
            pedido.setEstado("PENDIENTE");

            // 3. Calcular subtotal
            double subtotal = 0.0;
            for (ItemRequest item : request.getItems()) {
                subtotal += item.getPrecioUnitario() * item.getCantidad();
            }

            // 4. Calcular delivery según tipoEntrega
            double costoDelivery = 0.0;
            if ("Delivery".equalsIgnoreCase(request.getTipoEntrega())) {
                costoDelivery = 5.0;
            }

            pedido.setSubtotal(subtotal);
            pedido.setDelivery(costoDelivery);
            pedido.setTotal(subtotal + costoDelivery);

            // 5. Guardar el pedido
            Pedido pedidoGuardado = pedidoRepository.save(pedido);

            // 6. Guardar detalles
            for (ItemRequest item : request.getItems()) {
                DetallePedido detalle = new DetallePedido();
                detalle.setPedido(pedidoGuardado);

                Producto producto = productoRepository.findById(item.getProductoId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                detalle.setProducto(producto);
                detalle.setCantidad(item.getCantidad());
                detalle.setPrecioUnitario(item.getPrecioUnitario());
                detalle.setSubtotal(item.getPrecioUnitario() * item.getCantidad());

                detallePedidoRepository.save(detalle);
            }

            response.put("success", true);
            response.put("message", "Pedido creado con éxito");
            response.put("pedidoId", pedidoGuardado.getId());
            response.put("total", pedidoGuardado.getTotal());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error al procesar el pedido: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}