package com.orderflow.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientProductDto {
    private Long id;
    private Long clientId;
    private Long productId;
    private String productName;
    private String productSku;
    private String size;
    private String hsnCode;
    private String handle;
    private BigDecimal basePrice;
    private BigDecimal weightGrams;
    private BigDecimal agreedPrice;
    private String stereoRef;
    private String specialSpec;
    private String notes;
    private Boolean active;
}
