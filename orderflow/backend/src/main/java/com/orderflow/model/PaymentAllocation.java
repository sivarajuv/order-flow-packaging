package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payment_allocations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentAllocation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Payment payment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false)
    private BigDecimal allocatedAmount;

    @Builder.Default
    private LocalDate allocationDate = LocalDate.now();
}
