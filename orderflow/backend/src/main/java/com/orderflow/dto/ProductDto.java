package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductDto {
    private Long id;
    private String sku;
    private String name;
    private String category;
    private String size;
    private String handle;
    private String uom;
    private BigDecimal basePrice;
    private String status;
}
