package com.orderflow.dto;

import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private String expenseDate;
    private String category;
    private String paidTo;
    private String description;
    private BigDecimal amount;
    private String notes;
}
