package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.*;
import com.orderflow.repository.PaymentAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapperService {

    private final PaymentAllocationRepository allocRepo;

    public ClientDto toClientDto(Client c) {
        return ClientDto.builder()
                .id(c.getId()).code(c.getCode()).name(c.getName()).gstNo(c.getGstNo())
                .billingAddress(c.getBillingAddress()).shippingAddress(c.getShippingAddress())
                .phone(c.getPhone()).email(c.getEmail()).salesperson(c.getSalesperson()).areaCode(c.getAreaCode())
                .creditLimit(c.getCreditLimit()).paymentTerms(c.getPaymentTerms())
                .gstPercent(c.getGstPercent())
                .pyOutstanding(c.getPyOutstanding()).cyOutstanding(c.getCyOutstanding())
                .status(c.getStatus().name())
                .build();
    }

    public ProductDto toProductDto(Product p) {
        return ProductDto.builder()
                .id(p.getId()).sku(p.getSku()).name(p.getName())
                .category(p.getCategory()).size(p.getSize()).handle(p.getHandle())
                .uom(p.getUom()).basePrice(p.getBasePrice())
                .status(p.getStatus().name())
                .build();
    }

    public ClientProductDto toClientProductDto(ClientProduct cp) {
        Product p = cp.getProduct();
        return ClientProductDto.builder()
                .id(cp.getId())
                .clientId(cp.getClient().getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSku(p.getSku())
                .size(p.getSize())
                .handle(p.getHandle())
                .basePrice(p.getBasePrice())
                .agreedPrice(cp.getAgreedPrice())
                .stereoRef(cp.getStereoRef())
                .specialSpec(cp.getSpecialSpec())
                .notes(cp.getNotes())
                .active(cp.getActive())
                .build();
    }

    public SalesOrderDto toSalesOrderDto(SalesOrder o) {
        Client c = o.getClient();
        BigDecimal subtotal = o.getLines().stream()
                .map(l -> l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SalesOrderLineDto> lineDtos = o.getLines().stream()
                .map(this::toSalesOrderLineDto)
                .collect(Collectors.toList());

        return SalesOrderDto.builder()
                .id(o.getId()).orderNo(o.getOrderNo())
                .clientId(c.getId()).clientName(c.getName()).clientCode(c.getCode())
                .salesperson(c.getSalesperson()).clientGstPercent(c.getGstPercent())
                .orderDate(o.getOrderDate() != null ? o.getOrderDate().toString() : null)
                .deliveryDate(o.getDeliveryDate() != null ? o.getDeliveryDate().toString() : null)
                .status(o.getStatus().name()).notes(o.getNotes())
                .lines(lineDtos).subtotal(subtotal).total(subtotal)
                .build();
    }

    public SalesOrderLineDto toSalesOrderLineDto(SalesOrderLine l) {
        ClientProduct cp = l.getClientProduct();
        Product p = cp.getProduct();
        JobCard jc = l.getJobCard();
        return SalesOrderLineDto.builder()
                .id(l.getId())
                .clientProductId(cp.getId())
                .productName(p.getName()).sku(p.getSku())
                .size(p.getSize()).handle(p.getHandle())
                .stereoRef(cp.getStereoRef())
                .qty(l.getQty()).unitPrice(l.getUnitPrice()).spec(l.getSpec())
                .jobCardId(jc != null ? jc.getId() : null)
                .jobCardNo(jc != null ? jc.getJobCardNo() : null)
                .jobCardStatus(jc != null ? jc.getStatus().name() : null)
                .build();
    }

    public JobCardDto toJobCardDto(JobCard jc) {
        SalesOrderLine line = jc.getOrderLine();
        ClientProduct cp = line.getClientProduct();
        Product p = cp.getProduct();
        SalesOrder o = line.getSalesOrder();
        Client c = o.getClient();

        List<JobActivityDto> actDtos = jc.getActivities().stream()
                .map(a -> JobActivityDto.builder()
                        .id(a.getId())
                        .activityType(a.getActivityType().name())
                        .description(a.getDescription())
                        .performedBy(a.getPerformedBy())
                        .activityTime(a.getActivityTime() != null ? a.getActivityTime().toString() : null)
                        .notes(a.getNotes())
                        .build())
                .collect(Collectors.toList());

        List<String> doneStages = jc.getActivities().stream()
                .map(a -> a.getActivityType().name())
                .distinct()
                .collect(Collectors.toList());

        return JobCardDto.builder()
                .id(jc.getId()).jobCardNo(jc.getJobCardNo())
                .orderId(o.getId()).orderNo(o.getOrderNo())
                .orderLineId(line.getId())
                .clientId(c.getId()).clientName(c.getName()).salesperson(c.getSalesperson()).areaCode(c.getAreaCode())
                .productId(p.getId()).productName(p.getName()).sku(p.getSku())
                .size(p.getSize()).handle(p.getHandle()).stereoRef(cp.getStereoRef())
                .qty(line.getQty()).spec(line.getSpec())
                .startDate(jc.getStartDate() != null ? jc.getStartDate().toString() : null)
                .dueDate(jc.getDueDate() != null ? jc.getDueDate().toString() : null)
                .status(jc.getStatus().name())
                .instructions(jc.getInstructions())
                .doneStages(doneStages)
                .activities(actDtos)
                .build();
    }

    public InvoiceDto toInvoiceDto(Invoice inv) {
        BigDecimal paid = allocRepo.sumAllocatedByInvoiceId(inv.getId());
        if (paid == null) paid = BigDecimal.ZERO;

        List<InvoiceLineDto> lineDtos = inv.getLines().stream().map(l -> {
            SalesOrderLine ol = l.getOrderLine();
            Product p = ol.getClientProduct().getProduct();
            BigDecimal base = l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQty()));
            BigDecimal tax = base.multiply(BigDecimal.valueOf(l.getTaxPercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return InvoiceLineDto.builder()
                    .id(l.getId()).orderLineId(ol.getId())
                    .productName(p.getName()).size(p.getSize()).handle(p.getHandle())
                    .qty(l.getQty()).unitPrice(l.getUnitPrice())
                    .taxPercent(l.getTaxPercent()).taxAmount(tax).lineTotal(base.add(tax))
                    .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = lineDtos.stream()
                .map(l -> l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal taxTotal = lineDtos.stream()
                .map(InvoiceLineDto::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = subtotal.add(taxTotal);

        return InvoiceDto.builder()
                .id(inv.getId()).invoiceNo(inv.getInvoiceNo())
                .orderId(inv.getSalesOrder().getId()).orderNo(inv.getSalesOrder().getOrderNo())
                .clientId(inv.getClient().getId()).clientName(inv.getClient().getName())
                .clientGstNo(inv.getClient().getGstNo())
                .invoiceDate(inv.getInvoiceDate() != null ? inv.getInvoiceDate().toString() : null)
                .dueDate(inv.getDueDate() != null ? inv.getDueDate().toString() : null)
                .gstPercent(inv.getGstPercent()).status(inv.getStatus().name())
                .lines(lineDtos).subtotal(subtotal).taxTotal(taxTotal).total(total)
                .paidAmount(paid).balanceDue(total.subtract(paid))
                .build();
    }

    public PaymentDto toPaymentDto(Payment p) {
        List<PaymentDto.AllocationDto> allocDtos = p.getAllocations().stream()
                .map(a -> PaymentDto.AllocationDto.builder()
                        .invoiceId(a.getInvoice().getId())
                        .invoiceNo(a.getInvoice().getInvoiceNo())
                        .amount(a.getAllocatedAmount())
                        .build())
                .collect(Collectors.toList());

        return PaymentDto.builder()
                .id(p.getId()).paymentRef(p.getPaymentRef())
                .clientId(p.getClient().getId()).clientName(p.getClient().getName())
                .paymentDate(p.getPaymentDate() != null ? p.getPaymentDate().toString() : null)
                .amount(p.getAmount()).mode(p.getMode())
                .bankRef(p.getBankRef()).notes(p.getNotes())
                .status(p.getStatus().name())
                .allocations(allocDtos)
                .build();
    }
}
