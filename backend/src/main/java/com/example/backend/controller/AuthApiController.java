package com.example.backend.controller;

import com.example.backend.entity.Usuario;
import com.example.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthApiController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // ========== LOGIN ==========
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null) {
            response.put("success", false);
            response.put("errorMsg", "usuario_no_existe");
            return ResponseEntity.ok(response);
        }

        // 👇 BCrypt: compara el password escrito con el hash de la BD
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            response.put("success", false);
            response.put("errorMsg", "contrasena_incorrecta");
            return ResponseEntity.ok(response);
        }

        if (usuario.getDirecciones() != null) {
            usuario.getDirecciones().size();
        }
        session.setAttribute("usuario", usuario);

        response.put("success", true);
        response.put("nombre", usuario.getNombre());
        response.put("rol", usuario.getRol());
        response.put("email", usuario.getEmail());
        response.put("id", usuario.getId());
        return ResponseEntity.ok(response);
    }

    // ========== REGISTRO ==========
    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registro(
            @RequestParam String nombre,
            @RequestParam String email,
            @RequestParam String telefono,
            @RequestParam String password) {

        Map<String, Object> response = new HashMap<>();

        if (usuarioRepository.existsByEmail(email)) {
            response.put("success", false);
            response.put("errorMsg", "email_ya_registrado");
            return ResponseEntity.ok(response);
        }

        Usuario nuevo = new Usuario();
        nuevo.setNombre(nombre);
        nuevo.setEmail(email);
        nuevo.setTelefono(telefono);

        // 👇 BCrypt: encripta el password antes de guardar
        nuevo.setPassword(passwordEncoder.encode(password));

        nuevo.setRol("USER");
        nuevo.setFechaRegistro(LocalDateTime.now());
        usuarioRepository.save(nuevo);

        response.put("success", true);
        response.put("message", "Usuario registrado correctamente");
        return ResponseEntity.ok(response);
    }

    // ========== LOGOUT ==========
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // ========== ME ==========
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Usuario usuario = (Usuario) session.getAttribute("usuario");

        if (usuario == null) {
            response.put("success", false);
            return ResponseEntity.ok(response);
        }

        response.put("success", true);
        response.put("id", usuario.getId());
        response.put("nombre", usuario.getNombre());
        response.put("email", usuario.getEmail());
        response.put("telefono", usuario.getTelefono());
        response.put("rol", usuario.getRol());
        return ResponseEntity.ok(response);
    }
}