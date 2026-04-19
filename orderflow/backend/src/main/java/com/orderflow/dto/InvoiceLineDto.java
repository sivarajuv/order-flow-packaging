package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceLineDto {
    private Long id;
    private Long orderLineId;
    private String productName;
    private String size;
    private String handle;
    private Integer qty;
    private BigDecimal unitPrice;
    private Integer taxPercent;
    private BigDecimal taxAmount;
    private BigDecimal lineTotal;
}
