package com.example.backend.repository;

import com.example.backend.entity.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;



public interface ContactoRepository extends JpaRepository<Contacto, Long> {
}