package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // 👇 Clave secreta (en producción debe ir en application.properties)
    @Value("${jwt.secret:DonVictorClaveSecretaSuperLargaParaQueFuncioneConHS256PorFavorCambiarEnProduccion2024}")
    private String secretKey;

    // 👇 Tiempo de expiración: 24 horas
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    // ========== GENERAR TOKEN ==========
    public String generarToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // 👇 Agregar el rol a los claims
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .toList());

        return crearToken(claims, userDetails.getUsername());
    }

    private String crearToken(Map<String, Object> claims, String subject) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + jwtExpiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(getClaveFirma(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ========== VALIDAR TOKEN ==========
    public boolean esTokenValido(String token, UserDetails userDetails) {
        try {
            final String username = extraerUsername(token);
            return username.equals(userDetails.getUsername()) && !esTokenExpirado(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean esTokenExpirado(String token) {
        return extraerFechaExpiracion(token).before(new Date());
    }

    // ========== EXTRAER DATOS DEL TOKEN ==========
    public String extraerUsername(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public Date extraerFechaExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith(getClaveFirma())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ========== CLAVE DE FIRMA ==========
    private SecretKey getClaveFirma() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}