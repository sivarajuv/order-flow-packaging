package com.orderflow.repository;

import com.orderflow.model.ClientProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClientProductRepository extends JpaRepository<ClientProduct, Long> {
    // Use underscore navigation for nested properties on @ManyToOne fields
    List<ClientProduct> findByClient_Id(Long clientId);
    boolean existsByClient_IdAndProduct_Id(Long clientId, Long productId);
}
