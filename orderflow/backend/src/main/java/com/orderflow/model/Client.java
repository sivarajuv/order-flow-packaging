package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "clients")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Client {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String gstNo;
    private String billingAddress;
    private String shippingAddress;
    private String phone;
    private String email;
    private String salesperson;
    private String areaCode;

    @Builder.Default
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Builder.Default
    private String paymentTerms = "Net 30";

    @Builder.Default
    private Integer gstPercent = 18;   // 0, 5, or 18

    @Builder.Default
    private BigDecimal pyOutstanding = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal cyOutstanding = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ClientStatus status = ClientStatus.ACTIVE;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<ClientProduct> clientProducts;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<SalesOrder> salesOrders;

    public enum ClientStatus { ACTIVE, ON_HOLD, INACTIVE }
}
