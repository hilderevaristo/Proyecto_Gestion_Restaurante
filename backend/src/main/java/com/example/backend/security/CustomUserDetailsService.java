package com.example.backend.security;

import com.example.backend.entity.Usuario;
import com.example.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 👇 Buscar usuario en la BD
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        // 👇 Convertir el rol a formato Spring Security
        // Ej: "ADMIN" → "ROLE_ADMIN", "USER" → "ROLE_USER"
        String rolConPrefijo = "ROLE_" + usuario.getRol().toUpperCase();
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(rolConPrefijo)
        );

        // 👇 Retornar un User de Spring Security
        return new User(
                usuario.getEmail(),
                usuario.getPassword(),   // ¡Debe estar encriptado con BCrypt!
                authorities
        );
    }
}