package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentDto {
    private Long id;
    private String paymentRef;
    private Long clientId;
    private String clientName;
    private String paymentDate;
    private BigDecimal amount;
    private String mode;
    private String bankRef;
    private String notes;
    private String status;
    private List<AllocationDto> allocations;
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AllocationDto {
        private Long invoiceId;
        private String invoiceNo;
        private BigDecimal amount;
    }
}
