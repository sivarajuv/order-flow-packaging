package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate expenseDate;
    private String category;
    private String paidTo;
    private String description;

    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    private String notes;
}
