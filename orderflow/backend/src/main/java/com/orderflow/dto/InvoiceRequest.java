package com.orderflow.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class InvoiceRequest {
    private Long orderId;
    private String invoiceDate;
    private String dueDate;
    private Integer gstOverride;
}
