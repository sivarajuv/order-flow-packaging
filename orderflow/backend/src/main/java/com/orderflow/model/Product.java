package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String category;
    private String size;

    @Builder.Default
    private String handle = "None";   // Loop, D-cut, None, Other

    @Builder.Default
    private String uom = "Pcs";

    @Builder.Default
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    public enum ProductStatus { ACTIVE, INACTIVE }
}
