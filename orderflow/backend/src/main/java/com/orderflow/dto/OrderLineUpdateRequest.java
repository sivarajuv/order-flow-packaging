package com.orderflow.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderLineUpdateRequest {
    private Integer qty;
    private Integer salesQty;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private String spec;
}
