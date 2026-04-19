package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentRef;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    private LocalDate paymentDate;

    @Column(nullable = false)
    private BigDecimal amount;

    @Builder.Default
    private String mode = "NEFT";   // NEFT, RTGS, Cheque, Cash, UPI

    private String bankRef;
    private String notes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.CONFIRMED;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<PaymentAllocation> allocations = new ArrayList<>();

    public enum PaymentStatus { CONFIRMED, VOID }
}
