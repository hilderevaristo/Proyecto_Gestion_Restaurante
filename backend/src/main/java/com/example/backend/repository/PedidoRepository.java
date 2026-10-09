package com.example.backend.repository;

import com.example.backend.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // ✅ Con JOIN FETCH para cargar detalles y productos
    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.detalles d " +
           "LEFT JOIN FETCH d.producto")
    
List<Pedido> findAllWithDetails();
    
    List<Pedido> findAllByOrderByFechaPedidoDesc();
    long countByEstado(String estado);
}