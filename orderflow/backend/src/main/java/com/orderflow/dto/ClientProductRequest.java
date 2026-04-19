package com.orderflow.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientProductRequest {
    private Long productId;
    private BigDecimal agreedPrice;
    private String stereoRef;
    private String specialSpec;
    private String notes;
    private Boolean active;
}
