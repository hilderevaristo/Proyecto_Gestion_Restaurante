package com.example.backend.controller;

import com.example.backend.entity.Usuario;
import com.example.backend.repository.UsuarioRepository;
import com.example.backend.security.CustomUserDetailsService;
import com.example.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
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
    @Autowired private JwtService jwtService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private CustomUserDetailsService userDetailsService;

    // ========== LOGIN (devuelve JWT) ==========
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String email,
            @RequestParam String password) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 1. Autenticar con AuthenticationManager (verifica BCrypt)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // 2. Cargar el usuario para sacar sus datos
            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
            if (usuario == null) {
                response.put("success", false);
                response.put("errorMsg", "usuario_no_existe");
                return ResponseEntity.ok(response);
            }

            // 3. Cargar UserDetails y generar token
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generarToken(userDetails);

            // 4. Responder con token + datos del usuario
            response.put("success", true);
            response.put("token", token);
            response.put("nombre", usuario.getNombre());
            response.put("email", usuario.getEmail());
            response.put("rol", usuario.getRol());
            response.put("id", usuario.getId());

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // Contraseña incorrecta
            response.put("success", false);
            response.put("errorMsg", "contrasena_incorrecta");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("errorMsg", "usuario_no_existe");
            return ResponseEntity.ok(response);
        }
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
        nuevo.setPassword(passwordEncoder.encode(password)); // BCrypt
        nuevo.setRol("USER");
        nuevo.setFechaRegistro(LocalDateTime.now());

        usuarioRepository.save(nuevo);

        response.put("success", true);
        response.put("message", "Usuario registrado correctamente");
        return ResponseEntity.ok(response);
    }

    // ========== LOGOUT ==========
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Sesión cerrada");
        return ResponseEntity.ok(response);
        // Con JWT, el logout es simple: el cliente borra el token
    }

    // ========== ME (usuario actual desde el token) ==========
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("success", false);
            return ResponseEntity.ok(response);
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtService.extraerUsername(token);
            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

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

        } catch (Exception e) {
            response.put("success", false);
            return ResponseEntity.ok(response);
        }
    }
}