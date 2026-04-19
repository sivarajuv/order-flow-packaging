package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SalesOrderLineDto {
    private Long id;
    private Long clientProductId;
    private String productName;
    private String sku;
    private String size;
    private String handle;
    private String stereoRef;
    private Integer qty;
    private BigDecimal unitPrice;
    private String spec;
    private Long jobCardId;
    private String jobCardNo;
    private String jobCardStatus;
}
