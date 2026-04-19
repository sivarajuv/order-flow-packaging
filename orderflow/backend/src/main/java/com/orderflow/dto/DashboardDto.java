package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardDto {
    private BigDecimal totalCyOutstanding;
    private BigDecimal totalPyOutstanding;
    private int openOrders;
    private int activeJobs;
    private int overdueInvoices;
    private List<JobCardDto> activeJobCards;
    private List<InvoiceDto> unpaidInvoices;
    private List<ClientDto> clientSummary;
}
