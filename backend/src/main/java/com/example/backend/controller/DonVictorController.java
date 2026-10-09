/* package com.example.backend.controller;

import com.example.backend.entity.Contacto;
import com.example.backend.entity.DetallePedido;
import com.example.backend.entity.ItemCarrito;
import com.example.backend.entity.Pedido;
import com.example.backend.entity.Producto;
import com.example.backend.entity.Usuario;
import com.example.backend.repository.ContactoRepository;
import com.example.backend.repository.DetallePedidoRepository;
import com.example.backend.repository.ProductoRepository;
import com.example.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.repository.PedidoRepository;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List; // ← Agregar al inicio
import java.util.Map;
import java.util.Optional;

@Controller
public class DonVictorController {

    private final DetallePedidoRepository detallePedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ContactoRepository contactoRepository;
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;

    public DonVictorController(UsuarioRepository usuarioRepository,
            ContactoRepository contactoRepository,
            ProductoRepository productoRepository,
            PedidoRepository pedidoRepository, DetallePedidoRepository detallePedidoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.contactoRepository = contactoRepository;
        this.productoRepository = productoRepository;
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
    }

    @GetMapping("/")
    public String index(HttpSession session, Model model) {

        try {
            // ✅ CORRECCIÓN: Refrescar el usuario en sesión con sus direcciones
            Usuario usuarioSession = (Usuario) session.getAttribute("usuario");
            if (usuarioSession != null) {
                Usuario usuarioCompleto = usuarioRepository.findById(usuarioSession.getId()).orElse(null);
                if (usuarioCompleto != null) {
                    // Forzamos la inicialización llamando al getter del proxy LAZY
                    usuarioCompleto.getDirecciones().size(); 
                    session.setAttribute("usuario", usuarioCompleto);
                }
            }

            model.addAttribute("productos", productoRepository.findAll());
            System.out.println("Productos: " + productoRepository.findAll().size());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/registro")
    public String registro() {
        return "registro";
    }

    @PostMapping("/procesarRegistro")
    public String procesarRegistro(@RequestParam String nombre,
            @RequestParam String email,
            @RequestParam String telefono,
            @RequestParam String password,
            Model model) {

        if (usuarioRepository.existsByEmail(email)) {
            model.addAttribute("error", "El correo ya está registrado");
            return "registro";
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(nombre);
        nuevoUsuario.setEmail(email);
        nuevoUsuario.setTelefono(telefono);
        nuevoUsuario.setPassword(password); // ✅ SIN ENCRIPTAR
        nuevoUsuario.setRol("USER");
        nuevoUsuario.setFechaRegistro(LocalDateTime.now());

        usuarioRepository.save(nuevoUsuario);

        return "redirect:/login?registroExitoso=true";
    }

    @PostMapping("/procesarLogin")
@ResponseBody
public Map<String, Object> procesarLogin(@RequestParam String email,
                                         @RequestParam String password,
                                         HttpSession session) {

    Map<String, Object> response = new HashMap<>();

    System.out.println("=== INTENTO DE LOGIN ===");
    System.out.println("Email: " + email);

    // Buscar usuario por email
    Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

    // ✅ CASO 1: Usuario NO existe
    if (usuario == null) {
        System.out.println("❌ Usuario NO existe");
        response.put("success", false);
        response.put("errorMsg", "usuario_no_existe");
        return response;
    }

    // ✅ CASO 2: Contraseña incorrecta
    if (!usuario.getPassword().equals(password)) {
        System.out.println("❌ Contraseña incorrecta");
        response.put("success", false);
        response.put("errorMsg", "contrasena_incorrecta");
        return response;
    }

    // ✅ CASO 3: Login exitoso
    System.out.println("✅ Usuario: " + usuario.getNombre());
    System.out.println("Rol: " + usuario.getRol());
    
    // ✅ CORRECCIÓN: Forzar la carga de la lista LAZY antes de guardar en sesión
    usuario.getDirecciones().size(); 
    session.setAttribute("usuario", usuario);

    response.put("success", true);
    response.put("nombre", usuario.getNombre());
    response.put("rol", usuario.getRol());

    return response;
}

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    @PostMapping("/procesarContacto")
    public String procesarContacto(@RequestParam String nombre,
            @RequestParam String email,
            @RequestParam(required = false) String telefono,
            @RequestParam String mensaje,
            RedirectAttributes redirectAttributes) {

        Contacto contacto = new Contacto();
        contacto.setNombre(nombre);
        contacto.setEmail(email);
        contacto.setTelefono(telefono);
        contacto.setMensaje(mensaje);

        contactoRepository.save(contacto);

        redirectAttributes.addAttribute("exito", true);
        return "redirect:/#contactos";
    }
    // ========== ADMIN PANEL ==========

    @GetMapping("/admin/dashboard")
    public String adminDashboard(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");

        if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
            return "redirect:/login";
        }

        long totalProductos = productoRepository.count();
        long totalUsuarios = usuarioRepository.count();

        List<Pedido> todosLosPedidos = pedidoRepository.findAll();
        long totalOrdenes = todosLosPedidos.size();

        double totalIngresos = todosLosPedidos.stream()
                .filter(p -> p.getEstado() != null && !"CANCELADO".equals(p.getEstado().toUpperCase()))
                .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                .sum();

        model.addAttribute("totalProductos", totalProductos);
        model.addAttribute("totalUsuarios", totalUsuarios);
        model.addAttribute("totalOrdenes", totalOrdenes);
        model.addAttribute("totalIngresos", totalIngresos);

        model.addAttribute("listaUsuarios", usuarioRepository.findAll());
        model.addAttribute("listaPedidos", todosLosPedidos);
        
        model.addAttribute("adminNombre", usuario.getNombre());
        model.addAttribute("pagina", "dashboard");

        return "admin/dashboard";
    }

    // ========== ADMIN USUARIOS ==========
    @GetMapping("/admin/usuarios")
public String adminUsuarios(HttpSession session, Model model) {
    Usuario usuario = (Usuario) session.getAttribute("usuario");

    if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
        return "redirect:/login";
    }

    try {
        // Obtener todos los usuarios de la base de datos menos el administrador en sesión
        List<Usuario> listaUsuarios = usuarioRepository.findAll();
        listaUsuarios.removeIf(u -> u.getEmail().equals(usuario.getEmail()));

        model.addAttribute("listaUsuarios", listaUsuarios);
        model.addAttribute("totalUsuarios", listaUsuarios.size());
    } catch (Exception e) {
        System.out.println("❌ Error al obtener usuarios: " + e.getMessage());
        model.addAttribute("listaUsuarios", new ArrayList<>());
        model.addAttribute("totalUsuarios", 0);
    }

    model.addAttribute("adminNombre", usuario.getNombre());
    model.addAttribute("pagina", "usuarios");

    return "admin/usuarios";
}
    // ========== ADMIN PRODUCTOS ==========
   // ========== ADMIN PRODUCTOS ==========
@GetMapping("/admin/productos")
public String adminProductos(HttpSession session, Model model) {
    Usuario usuario = (Usuario) session.getAttribute("usuario");
    
    if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
        return "redirect:/login";
    }
    
    // 📊 Traemos la lista real de la base de datos
    List<Producto> listaProductos = productoRepository.findAll();
    
    model.addAttribute("listaProductos", listaProductos);
    model.addAttribute("totalProductos", listaProductos.size());
    model.addAttribute("adminNombre", usuario.getNombre());
    model.addAttribute("pagina", "productos");
    
    return "admin/productos";
}

// ========== EDITAR PRODUCTO ==========
@GetMapping("/admin/productos/editar/{id}")
public String editarProducto(@PathVariable Long id, HttpSession session, Model model) {
    Usuario admin = (Usuario) session.getAttribute("usuario");
    if (admin == null || !"ADMIN".equals(admin.getRol())) {
        return "redirect:/login";
    }
    
    Producto producto = productoRepository.findById(id).orElse(null);
    if (producto == null) {
        return "redirect:/admin/productos";
    }
    
    model.addAttribute("producto", producto);
    model.addAttribute("adminNombre", admin.getNombre());
    
    return "admin/productos-editar";
}

// ========== ELIMINAR PRODUCTO ==========
@PostMapping("/admin/productos/eliminar/{id}")
@ResponseBody
public Map<String, Object> eliminarProducto(@PathVariable Long id, HttpSession session) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        Usuario admin = (Usuario) session.getAttribute("usuario");
        if (admin == null || !"ADMIN".equals(admin.getRol())) {
            response.put("success", false);
            response.put("message", "No autorizado");
            return response;
        }
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto == null) {
            response.put("success", false);
            response.put("message", "Producto no encontrado");
            return response;
        }
        
        productoRepository.delete(producto);
        
        response.put("success", true);
        response.put("message", "Producto eliminado correctamente");
        
    } catch (Exception e) {
        e.printStackTrace();
        response.put("success", false);
        response.put("message", e.getMessage());
    }
    
    return response;
}


@GetMapping("/admin/productos/test")
@ResponseBody
public String test() {
    return "✅ El controlador funciona!";
}
// ========== OBTENER PRODUCTO (para editar en modal) ==========
@GetMapping("/admin/productos/obtener/{id}")
@ResponseBody
public Map<String, Object> obtenerProducto(@PathVariable Long id) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        System.out.println("📦 Obteniendo producto ID: " + id);
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto == null) {
            response.put("success", false);
            response.put("message", "Producto no encontrado");
            return response;
        }
        
        Map<String, Object> productoData = new HashMap<>();
        productoData.put("id", producto.getId());
        productoData.put("nombre", producto.getNombre());
        productoData.put("descripcion", producto.getDescripcion());
        productoData.put("precio", producto.getPrecio());
        productoData.put("categoria", producto.getCategoria());
        productoData.put("imagenUrl", producto.getImagenUrl());
        
        response.put("success", true);
        response.put("producto", productoData);
        
        System.out.println("✅ Producto encontrado: " + producto.getNombre());
        
    } catch (Exception e) {
        e.printStackTrace();
        response.put("success", false);
        response.put("message", e.getMessage());
    }
    
    return response;
}

// ========== ACTUALIZAR PRODUCTO ==========
@PostMapping("/admin/productos/actualizar")
public String actualizarProducto(@RequestParam Long id,
                                 @RequestParam String nombre,
                                 @RequestParam(required = false) String descripcion,
                                 @RequestParam Double precio,
                                 @RequestParam String categoria,
                                 @RequestParam(required = false) String imagenUrl,
                                 RedirectAttributes redirectAttributes) {
    try {
        System.out.println("📦 Actualizando producto ID: " + id);
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto == null) {
            redirectAttributes.addFlashAttribute("error", "Producto no encontrado");
            return "redirect:/admin/productos";
        }
        
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setPrecio(precio);
        producto.setCategoria(categoria);
        producto.setImagenUrl(imagenUrl);
        
        productoRepository.save(producto);
        
        redirectAttributes.addFlashAttribute("exito", "✅ Producto actualizado correctamente");
        System.out.println("✅ Producto actualizado: " + nombre);
        
    } catch (Exception e) {
        e.printStackTrace();
        redirectAttributes.addFlashAttribute("error", "❌ Error: " + e.getMessage());
    }
    
    return "redirect:/admin/productos";
}

// ========== MOSTRAR FORMULARIO NUEVO PRODUCTO ==========
@GetMapping("/admin/productos/nuevo")
public String nuevoProducto(HttpSession session, Model model) {
    Usuario usuario = (Usuario) session.getAttribute("usuario");
    if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
        return "redirect:/login";
    }
    model.addAttribute("adminNombre", usuario.getNombre());
    return "admin/productos-nuevo";
}

// ========== GUARDAR PRODUCTO (DESDE MODAL) ==========
@PostMapping("/admin/productos/guardar")
@ResponseBody
public Map<String, Object> guardarProducto(
        @RequestParam String nombre,
        @RequestParam(required = false) String descripcion,
        @RequestParam Double precio,
        @RequestParam String categoria,
        @RequestParam(required = false) String imagenUrl) {  // ← SOLO ESTO

    Map<String, Object> response = new HashMap<>();

    try {
        System.out.println("=== GUARDAR PRODUCTO ===");
        System.out.println("Nombre: " + nombre);
        System.out.println("Precio: " + precio);
        System.out.println("Categoria: " + categoria);
        System.out.println("imagenUrl: " + (imagenUrl != null ? imagenUrl : "null"));

        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion != null ? descripcion : "");
        producto.setPrecio(precio);
        producto.setCategoria(categoria);

        // ✅ GUARDAR URL DE CLOUDINARY
        if (imagenUrl != null && !imagenUrl.trim().isEmpty()) {
            producto.setImagenUrl(imagenUrl.trim());
            System.out.println("✅ URL guardada: " + imagenUrl);
        } else {
            producto.setImagenUrl(null);
            System.out.println("ℹ️ Sin imagen");
        }

        productoRepository.save(producto);
        System.out.println("✅ Producto guardado en BD");

        response.put("success", true);
        response.put("message", "Producto creado correctamente");

    } catch (Exception e) {
        e.printStackTrace();
        response.put("success", false);
        response.put("message", e.getMessage());
    }

    return response;
}

    @PostMapping("/admin/eliminarUsuario")
    public String eliminarUsuario(@RequestParam Long id,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        Usuario admin = (Usuario) session.getAttribute("usuario");

        if (admin == null || !"ADMIN".equals(admin.getRol())) {
            return "redirect:/login";
        }

        // Buscar el usuario a eliminar
        Usuario usuarioAEliminar = usuarioRepository.findById(id).orElse(null);

        // Verificar que el usuario existe y no es el admin actual
        if (usuarioAEliminar != null && !usuarioAEliminar.getEmail().equals(admin.getEmail())) {
            usuarioRepository.delete(usuarioAEliminar);
            redirectAttributes.addFlashAttribute("mensajeExito", "Usuario eliminado correctamente");
        } else {
            redirectAttributes.addFlashAttribute("mensajeError", "No puedes eliminar al administrador principal");
        }

        return "redirect:/admin/usuarios";
    }


  @GetMapping("/admin/pedidos")
public String adminPedidos(HttpSession session, Model model) {
    Usuario usuario = (Usuario) session.getAttribute("usuario");

    if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
        return "redirect:/login";
    }

    try {
        List<Pedido> listaPedidos = pedidoRepository.findAll();

        // ✅ LOG PARA VER LOS DATOS
        System.out.println("=== DATOS DE PEDIDOS ===");
        System.out.println("Total pedidos en BD: " + listaPedidos.size());
        
        for (Pedido p : listaPedidos) {
            System.out.println("ID: " + p.getId() + " - Estado: '" + p.getEstado() + "'");
        }

        long totalPedidos = listaPedidos.size();
        long completados = listaPedidos.stream()
                .filter(p -> p.getEstado() != null && p.getEstado().toUpperCase().equals("COMPLETADO"))
                .count();
        long pendientes = listaPedidos.stream()
                .filter(p -> p.getEstado() != null && p.getEstado().toUpperCase().equals("PENDIENTE"))
                .count();
        double ingresos = listaPedidos.stream()
                .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                .sum();

        System.out.println("Completados contados: " + completados);
        System.out.println("Pendientes contados: " + pendientes);
        System.out.println("Ingresos: " + ingresos);

        model.addAttribute("listaPedidos", listaPedidos);
        model.addAttribute("totalPedidos", totalPedidos);
        model.addAttribute("completados", completados);
        model.addAttribute("pendientes", pendientes);
        model.addAttribute("ingresos", ingresos);
        model.addAttribute("adminNombre", usuario.getNombre());
        model.addAttribute("pagina", "pedidos");

    } catch (Exception e) {
        System.out.println("❌ ERROR: " + e.getMessage());
        e.printStackTrace();
        model.addAttribute("listaPedidos", new ArrayList<>());
        model.addAttribute("totalPedidos", 0);
        model.addAttribute("completados", 0);
        model.addAttribute("pendientes", 0);
        model.addAttribute("ingresos", 0.0);
        model.addAttribute("adminNombre", usuario.getNombre());
        model.addAttribute("pagina", "pedidos");
    }

    return "admin/pedidos";
}

@PostMapping("/admin/pedido-cambiar-estado")
@ResponseBody
public Map<String, Object> cambiarEstadoPedido(@RequestParam Long id, @RequestParam String estado) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        System.out.println("📦 Cambiando estado - ID: " + id + ", Nuevo estado: " + estado);
        
        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) {
            response.put("success", false);
            response.put("message", "Pedido no encontrado");
            return response;
        }
        
        // ✅ ESTADOS PERMITIDOS (actualizado con tus estados)
        String[] estadosPermitidos = {"pendiente", "procesando", "enviado", "completado", "cancelado"};
        
        boolean estadoValido = false;
        for (String e : estadosPermitidos) {
            if (e.equals(estado)) {
                estadoValido = true;
                break;
            }
        }
        
        if (!estadoValido) {
            response.put("success", false);
            response.put("message", "Estado no válido: " + estado);
            return response;
        }
        
        pedido.setEstado(estado);
        pedidoRepository.save(pedido);
        
        System.out.println("✅ Estado actualizado correctamente");
        response.put("success", true);
        response.put("message", "Estado actualizado correctamente");
        
    } catch (Exception e) {
        e.printStackTrace();
        response.put("success", false);
        response.put("message", e.getMessage());
    }
    
    return response;
}


@PostMapping("/admin/pedido-eliminar")
@ResponseBody
public Map<String, Object> eliminarPedido(@RequestParam Long id) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        System.out.println("🗑️ Eliminando pedido ID: " + id);
        
        // Verificar si existe
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);
        if (pedidoOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Pedido no encontrado");
            return response;
        }
        
        // ✅ ELIMINAR EL PEDIDO
        pedidoRepository.deleteById(id);
        
        System.out.println("✅ Pedido eliminado correctamente");
        response.put("success", true);
        response.put("message", "Pedido eliminado correctamente");
        
    } catch (Exception e) {
        e.printStackTrace();
        response.put("success", false);
        response.put("message", "Error al eliminar: " + e.getMessage());
    }
    
    return response;
}

    @PostMapping(value = "/procesarPedido", consumes = "application/json")
    @ResponseBody
    public Map<String, Object> procesarPedido(@RequestBody Map<String, Object> pedidoData,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            String nombreCliente = (String) pedidoData.get("nombreCliente");
            String telefonoCliente = (String) pedidoData.get("telefonoCliente");
            String direccionCliente = (String) pedidoData.get("direccionCliente");
            String metodoPago = (String) pedidoData.get("metodoPago");
            String tipoEntrega = (String) pedidoData.get("tipoEntrega");

            Usuario usuario = (Usuario) session.getAttribute("usuario");

            // Crear pedido
            Pedido pedido = new Pedido();
            pedido.setUsuario(usuario);
            pedido.setNombreCliente(nombreCliente);
            pedido.setTelefonoCliente(telefonoCliente);
            pedido.setDireccionEntrega(direccionCliente);
            pedido.setMetodoPago(metodoPago);
            pedido.setEstado("PENDIENTE");
            pedido.setFechaPedido(LocalDateTime.now());

            // Calcular totales
            List<Map<String, Object>> items = (List<Map<String, Object>>) pedidoData.get("items");
            double subtotal = 0;
            for (Map<String, Object> item : items) {
                double precio = ((Number) item.get("precioUnitario")).doubleValue();
                int cantidad = (int) item.get("cantidad");
                subtotal += precio * cantidad;
            }

            double delivery = "Delivery".equals(tipoEntrega) ? 5.00 : 0.00;
            double total = subtotal + delivery;

            pedido.setSubtotal(subtotal);
            pedido.setDelivery(delivery);
            pedido.setTotal(total);

            Pedido pedidoGuardado = pedidoRepository.save(pedido);

            // Guardar detalles
            for (Map<String, Object> item : items) {
                Long productoId = ((Number) item.get("productoId")).longValue();
                int cantidad = (int) item.get("cantidad");
                double precio = ((Number) item.get("precioUnitario")).doubleValue();

                Producto producto = productoRepository.findById(productoId).orElse(null);
                if (producto != null) {
                    DetallePedido detalle = new DetallePedido();
                    detalle.setPedido(pedidoGuardado);
                    detalle.setProducto(producto);
                    detalle.setCantidad(cantidad);
                    detalle.setPrecioUnitario(precio);
                    detalle.setSubtotal(precio * cantidad);
                    detallePedidoRepository.save(detalle);
                }
            }

            session.removeAttribute("carrito");

            response.put("success", true);
            response.put("message", "Pedido confirmado con éxito");

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

}
 */