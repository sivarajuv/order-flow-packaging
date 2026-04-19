package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.*;
import com.orderflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final InvoiceRepository invoiceRepo;
    private final ClientRepository clientRepo;
    private final PaymentAllocationRepository allocRepo;
    private final MapperService mapper;

    public List<PaymentDto> getAll() {
        return paymentRepo.findAll().stream().map(mapper::toPaymentDto).collect(Collectors.toList());
    }

    public PaymentDto create(PaymentRequest req) {
        Client client = clientRepo.findById(req.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found: " + req.getClientId()));

        long count = paymentRepo.count() + 1;
        String payRef = "PAY-" + LocalDate.now().getYear() + "-" + String.format("%04d", count);

        Payment payment = Payment.builder()
                .paymentRef(payRef).client(client)
                .paymentDate(req.getPaymentDate() != null ? LocalDate.parse(req.getPaymentDate()) : LocalDate.now())
                .amount(req.getAmount()).mode(req.getMode() != null ? req.getMode() : "NEFT")
                .bankRef(req.getBankRef()).notes(req.getNotes())
                .status(Payment.PaymentStatus.CONFIRMED)
                .allocations(new ArrayList<>())
                .build();

        Payment saved = paymentRepo.save(payment);

        // Process allocations
        if (req.getAllocations() != null) {
            for (PaymentRequest.AllocationInput ai : req.getAllocations()) {
                if (ai.getAmount() == null || ai.getAmount().compareTo(BigDecimal.ZERO) <= 0) continue;
                Invoice invoice = invoiceRepo.findById(ai.getInvoiceId())
                        .orElseThrow(() -> new RuntimeException("Invoice not found: " + ai.getInvoiceId()));
                PaymentAllocation alloc = PaymentAllocation.builder()
                        .payment(saved).invoice(invoice)
                        .allocatedAmount(ai.getAmount())
                        .allocationDate(saved.getPaymentDate())
                        .build();
                allocRepo.save(alloc);

                // Refresh and update invoice status
                BigDecimal totalPaid = allocRepo.sumAllocatedByInvoiceId(invoice.getId());
                // Recalculate invoice total
                BigDecimal invTotal = invoice.getLines().stream().map(l -> {
                    BigDecimal base = l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQty()));
                    BigDecimal tax = base.multiply(BigDecimal.valueOf(l.getTaxPercent()))
                            .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                    return base.add(tax);
                }).reduce(BigDecimal.ZERO, BigDecimal::add);

                if (totalPaid.compareTo(invTotal) >= 0) {
                    invoice.setStatus(Invoice.InvoiceStatus.PAID);
                } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
                    invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
                }
                invoiceRepo.save(invoice);
            }
        }

        // Update client CY outstanding
        client.setCyOutstanding(
                client.getCyOutstanding().subtract(req.getAmount()).max(BigDecimal.ZERO));
        clientRepo.save(client);

        return mapper.toPaymentDto(paymentRepo.findById(saved.getId()).orElseThrow());
    }
}
