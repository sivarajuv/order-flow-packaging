package com.orderflow.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderDto {
    private Long id;
    private String orderNo;
    private Long clientId;
    private String clientName;
    private String clientCode;
    private String salesperson;
    private Integer clientGstPercent;
    private String placeOfSupply;
    private String orderDate;
    private String deliveryDate;
    private String status;
    private String notes;
    private List<SalesOrderLineDto> lines;
    private BigDecimal subtotal;
    private BigDecimal total;
}
