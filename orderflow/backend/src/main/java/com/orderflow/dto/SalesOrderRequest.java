package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor
public class SalesOrderRequest {
    private Long clientId;
    private String orderDate;
    private String deliveryDate;
    private String notes;
    private List<LineRequest> lines;
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LineRequest {
        private Long clientProductId;
        private Integer qty;
        private Integer salesQty;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private String spec;
    }
}
