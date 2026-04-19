package com.orderflow.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderLineUpdateRequest {
    private Integer qty;
    private BigDecimal unitPrice;
    private String spec;
}