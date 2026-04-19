package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "client_products",
       uniqueConstraints = @UniqueConstraint(columnNames = {"client_id", "product_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClientProduct {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private BigDecimal agreedPrice;   // client-specific negotiated rate
    private String stereoRef;         // artwork / stereo plate reference
    private String specialSpec;
    private String notes;

    @Builder.Default
    private Boolean active = true;
}
