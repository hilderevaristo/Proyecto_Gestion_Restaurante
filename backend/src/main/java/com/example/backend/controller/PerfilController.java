/* package com.example.backend.controller;

import com.example.backend.entity.Direccion;
import com.example.backend.entity.Usuario;
import com.example.backend.repository.DireccionRepository;
import com.example.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.transaction.annotation.Transactional; // IMPORTAR ESTO
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.nio.file.Paths;

@Controller
@RequestMapping("/perfil")
public class PerfilController {

    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;

    public PerfilController(UsuarioRepository usuarioRepository, DireccionRepository direccionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.direccionRepository = direccionRepository;
    }

    // 1. Mostrar la vista del perfil
    @Transactional
    @GetMapping
    public String verPerfil(HttpSession session, Model model) {
        Usuario usuarioSession = (Usuario) session.getAttribute("usuario");
        
        // Redirigir al login si no hay sesión
        if (usuarioSession == null) {
            return "redirect:/login";
        }

        // Obtener los datos más recientes del usuario desde la BD
        Usuario usuario = usuarioRepository.findById(usuarioSession.getId()).orElse(null);
        if (usuario == null) return "redirect:/login";

        // Cargar sus direcciones
        List<Direccion> direcciones = direccionRepository.findByUsuarioId(usuario.getId());

        model.addAttribute("usuario", usuario);
        model.addAttribute("direcciones", direcciones);
        
        return "perfil"; // Apunta al archivo perfil.html que crearemos luego
    }

    // 2. Actualizar Datos Básicos
    @PostMapping("/actualizar-datos")
    public String actualizarDatos(@RequestParam String nombre, @RequestParam String telefono, 
                                  HttpSession session, RedirectAttributes redirectAttributes) {
        Usuario usuarioSession = (Usuario) session.getAttribute("usuario");
        if (usuarioSession != null) {
            Usuario usuario = usuarioRepository.findById(usuarioSession.getId()).orElse(null);
            if(usuario != null) {
                usuario.setNombre(nombre);
                usuario.setTelefono(telefono);
                usuarioRepository.save(usuario);
                
                session.setAttribute("usuario", usuario); // Actualizamos la sesión
                redirectAttributes.addFlashAttribute("mensajeExito", "Tus datos han sido actualizados.");
            }
        }
        return "redirect:/perfil";
    }

    // 3. Cambiar Contraseña
    @PostMapping("/cambiar-password")
    public String cambiarPassword(@RequestParam String passwordActual, @RequestParam String nuevaPassword, 
                                  HttpSession session, RedirectAttributes redirectAttributes) {
        Usuario usuarioSession = (Usuario) session.getAttribute("usuario");
        if (usuarioSession != null) {
            Usuario usuario = usuarioRepository.findById(usuarioSession.getId()).orElse(null);
            if(usuario != null) {
                if(usuario.getPassword().equals(passwordActual)) {
                    usuario.setPassword(nuevaPassword);
                    usuarioRepository.save(usuario);
                    redirectAttributes.addFlashAttribute("mensajeExito", "Contraseña cambiada correctamente.");
                } else {
                    redirectAttributes.addFlashAttribute("mensajeError", "La contraseña actual es incorrecta.");
                }
            }
        }
        return "redirect:/perfil";
    }

    @PostMapping("/nueva-direccion")
    public String nuevaDireccion(@RequestParam String alias, @RequestParam String direccionExacta, 
                                 @RequestParam(required = false) String referencia, 
                                 HttpSession session, RedirectAttributes redirectAttributes) {
        Usuario usuarioSession = (Usuario) session.getAttribute("usuario");
        if (usuarioSession != null) {
            Usuario usuario = usuarioRepository.findById(usuarioSession.getId()).orElse(null);
            if(usuario != null) {
                Direccion direccion = new Direccion();
                direccion.setAlias(alias);
                direccion.setDireccionExacta(direccionExacta);
                direccion.setReferencia(referencia);
                direccion.setUsuario(usuario);
                
                // Lógica de predeterminada (la primera es principal)
                List<Direccion> existentes = direccionRepository.findByUsuarioId(usuario.getId());
                direccion.setEsPredeterminada(existentes.isEmpty());
                
                direccionRepository.save(direccion);

                // ✅ AQUÍ ESTÁ EL TRUCO: Refrescamos el usuario en la sesión
                Usuario usuarioActualizado = usuarioRepository.findById(usuario.getId()).orElse(usuario);
                session.setAttribute("usuario", usuarioActualizado);
                
                redirectAttributes.addFlashAttribute("mensajeExito", "Nueva dirección agregada a tu libreta.");
            }
        }
        return "redirect:/perfil";
    }
    
    // 5. Eliminar Dirección
    @PostMapping("/eliminar-direccion/{id}")
    public String eliminarDireccion(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        Usuario usuarioSession = (Usuario) session.getAttribute("usuario");
        if (usuarioSession != null) {
            direccionRepository.findById(id).ifPresent(direccion -> {
                // Verificar que la dirección pertenezca al usuario que la intenta borrar
                if(direccion.getUsuario().getId().equals(usuarioSession.getId())) {
                    direccionRepository.delete(direccion);
                    redirectAttributes.addFlashAttribute("mensajeExito", "Dirección eliminada correctamente.");
                }
            });
        }
        return "redirect:/perfil";
    }

    // ✅ 6. NUEVO: Marcar dirección como predeterminada
    @PostMapping("/predeterminada/{id}")
    public String marcarPredeterminada(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        Usuario usuarioSession = (Usuario) session.getAttribute("usuario");
        if (usuarioSession != null) {
            List<Direccion> direcciones = direccionRepository.findByUsuarioId(usuarioSession.getId());
            for (Direccion dir : direcciones) {
                // Si es la seleccionada, la pone en TRUE, las demás en FALSE
                dir.setEsPredeterminada(dir.getId().equals(id));
                direccionRepository.save(dir);
            }
            redirectAttributes.addFlashAttribute("mensajeExito", "Dirección principal actualizada.");
        }
        return "redirect:/perfil";
    }

} */