package com.example.backend.controller;

import com.example.backend.entity.Contacto;
import com.example.backend.repository.ContactoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contacto")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ContactoApiController {

    @Autowired
    private ContactoRepository contactoRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> recibirContacto(@RequestBody Contacto contactoData) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validaciones básicas
            if (contactoData.getNombre() == null || contactoData.getNombre().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El nombre es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }

            if (contactoData.getEmail() == null || contactoData.getEmail().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El email es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }

            if (contactoData.getMensaje() == null || contactoData.getMensaje().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El mensaje es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }

            // Crear contacto
            Contacto contacto = new Contacto();
            contacto.setNombre(contactoData.getNombre().trim());
            contacto.setEmail(contactoData.getEmail().trim());
            contacto.setTelefono(contactoData.getTelefono() != null ? contactoData.getTelefono().trim() : null);
            contacto.setMensaje(contactoData.getMensaje().trim());
            contacto.setFechaEnvio(LocalDateTime.now());

            contactoRepository.save(contacto);

            response.put("success", true);
            response.put("message", "¡Gracias por contactarnos! Tu mensaje ha sido enviado.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error al guardar el contacto: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Opcional: endpoint para listar los contactos (para admin)
    @GetMapping
    public ResponseEntity<?> listarContactos() {
        return ResponseEntity.ok(contactoRepository.findAll());
    }
}
