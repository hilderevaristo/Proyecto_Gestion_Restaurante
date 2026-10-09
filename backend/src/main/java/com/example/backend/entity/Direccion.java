package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "direcciones")
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String alias; // Ej: "Casa", "Trabajo"

    @Column(name = "direccion_exacta", nullable = false)
    private String direccionExacta; // Ej: "Av. Los Rosales 123"

    @Column(length = 255)
    private String referencia; // Ej: "Frente al parque"

    @Column(name = "es_predeterminada")
    private Boolean esPredeterminada = false;

    // Y al final, agrega sus respectivos Getter y Setter:
    public Boolean getEsPredeterminada() { return esPredeterminada != null ? esPredeterminada : false; }
public void setEsPredeterminada(Boolean esPredeterminada) { this.esPredeterminada = esPredeterminada; }
    
    // Relación: Muchas direcciones pertenecen a un Usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public Direccion() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }

    public String getDireccionExacta() { return direccionExacta; }
    public void setDireccionExacta(String direccionExacta) { this.direccionExacta = direccionExacta; }

    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}