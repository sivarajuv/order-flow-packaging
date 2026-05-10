package com.orderflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceUpdateRequest {
    private String invoiceDate;
    private String dueDate;
    private Integer gstPercent;
    private BigDecimal invoiceDiscount;
}
