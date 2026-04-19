package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_lines")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_line_id")
    private SalesOrderLine orderLine;

    @Column(nullable = false)
    private Integer qty;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Builder.Default
    private Integer taxPercent = 18;
}
