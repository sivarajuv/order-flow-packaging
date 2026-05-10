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
    private String clientBillingAddress;
    private String clientShippingAddress;
    private String clientAddress;
    private String placeOfSupply;
    private String invoiceDate;
    private String dueDate;
    private Integer gstPercent;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private Integer cgstPercent;
    private Integer sgstPercent;
    private Integer igstPercent;
    private String taxMode;
    private BigDecimal invoiceDiscount;
    private BigDecimal discountTotal;
    private String status;
    private List<InvoiceLineDto> lines;
    private BigDecimal subtotal;
    private BigDecimal taxTotal;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private BigDecimal balanceDue;
}
