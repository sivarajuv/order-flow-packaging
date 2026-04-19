package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceDto {
    private Long id;
    private String invoiceNo;
    private Long orderId;
    private String orderNo;
    private Long clientId;
    private String clientName;
    private String clientGstNo;
    private String invoiceDate;
    private String dueDate;
    private Integer gstPercent;
    private BigDecimal discountTotal;
    private String status;
    private List<InvoiceLineDto> lines;
    private BigDecimal subtotal;
    private BigDecimal taxTotal;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private BigDecimal balanceDue;
}
