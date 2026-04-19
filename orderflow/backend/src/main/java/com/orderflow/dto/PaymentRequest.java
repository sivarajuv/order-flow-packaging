package com.orderflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor
public class PaymentRequest {
    private Long clientId;
    private String paymentDate;
    private BigDecimal amount;
    private String mode;
    private String bankRef;
    private String notes;
    private List<AllocationInput> allocations;
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AllocationInput {
        private Long invoiceId;
        private BigDecimal amount;
    }
}
