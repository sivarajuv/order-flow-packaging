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
    private static final String COMPANY_STATE_CODE = "27";
    private static final String COMPANY_STATE_NAME = "MAHARASHTRA";

    public ClientDto toClientDto(Client c) {
        return ClientDto.builder()
                .id(c.getId()).code(c.getCode()).name(c.getName()).gstNo(c.getGstNo())
                .billingAddress(c.getBillingAddress()).shippingAddress(c.getShippingAddress()).placeOfSupply(c.getPlaceOfSupply())
                .phone(c.getPhone()).email(c.getEmail()).salesperson(c.getSalesperson()).areaCode(c.getAreaCode())
                .designFileName(c.getDesignFileName()).designUrl(c.getDesignUrl())
                .creditLimit(c.getCreditLimit()).paymentTerms(c.getPaymentTerms())
                .gstPercent(c.getGstPercent())
                .pyOutstanding(c.getPyOutstanding()).cyOutstanding(c.getCyOutstanding())
                .status(c.getStatus().name())
                .build();
    }

    public ProductDto toProductDto(Product p) {
        return ProductDto.builder()
                .id(p.getId()).sku(p.getSku()).name(p.getName())
                .category(p.getCategory()).size(p.getSize()).hsnCode(p.getHsnCode()).handle(p.getHandle())
                .uom(p.getUom()).basePrice(p.getBasePrice())
                .weightGrams(p.getWeightGrams())
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
                .hsnCode(p.getHsnCode())
                .handle(p.getHandle())
                .basePrice(p.getBasePrice())
                .weightGrams(p.getWeightGrams())
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
                .map(this::salesOrderLineTaxableAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SalesOrderLineDto> lineDtos = o.getLines().stream()
                .map(this::toSalesOrderLineDto)
                .collect(Collectors.toList());

        return SalesOrderDto.builder()
                .id(o.getId()).orderNo(o.getOrderNo())
                .clientId(c.getId()).clientName(c.getName()).clientCode(c.getCode())
                .salesperson(c.getSalesperson()).clientGstPercent(c.getGstPercent())
                .placeOfSupply(c.getPlaceOfSupply())
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
        BigDecimal baseAmount = salesOrderLineBaseAmount(l);
        BigDecimal discountAmount = salesOrderLineDiscountAmount(l);
        BigDecimal taxableAmount = baseAmount.subtract(discountAmount);
        return SalesOrderLineDto.builder()
                .id(l.getId())
                .clientProductId(cp.getId())
                .productName(p.getName()).sku(p.getSku())
                .size(p.getSize()).hsnCode(p.getHsnCode()).handle(p.getHandle())
                .stereoRef(cp.getStereoRef())
                .qty(l.getQty())
                .orderedQty(l.getQty())
                .salesQty(resolveSalesQty(l))
                .unitPrice(l.getUnitPrice())
                .discount(defaultDiscount(l))
                .discountAmount(discountAmount)
                .taxableAmount(taxableAmount)
                .lineTotal(taxableAmount)
                .spec(l.getSpec())
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
                        .qty(a.getQty())
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
                .weightGrams(defaultWeightGrams(p))
                .qty(line.getQty()).spec(line.getSpec())
                .materialRequiredKg(materialRequiredKg(p, line.getQty()))
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
            BigDecimal discountAmount = base.multiply(defaultDiscount(ol))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal taxable = base.subtract(discountAmount);
            BigDecimal tax = taxable.multiply(BigDecimal.valueOf(l.getTaxPercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return InvoiceLineDto.builder()
                    .id(l.getId()).orderLineId(ol.getId())
                    .productName(p.getName()).size(p.getSize()).hsnCode(p.getHsnCode()).handle(p.getHandle())
                    .qty(l.getQty())
                    .orderedQty(ol.getQty())
                    .salesQty(resolveSalesQty(ol))
                    .unitPrice(l.getUnitPrice())
                    .discount(defaultDiscount(ol))
                    .discountAmount(discountAmount)
                    .taxableAmount(taxable)
                    .taxPercent(l.getTaxPercent()).taxAmount(tax).lineTotal(taxable.add(tax))
                    .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = lineDtos.stream()
                .map(InvoiceLineDto::getTaxableAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal invoiceDiscount = defaultInvoiceDiscount(inv);
        BigDecimal discountTotal = lineDtos.stream()
                .map(InvoiceLineDto::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        discountTotal = discountTotal.add(invoiceDiscount);
        int gstPercent = inv.getGstPercent() != null ? inv.getGstPercent() : 0;
        BigDecimal taxTotal = subtotal.multiply(BigDecimal.valueOf(gstPercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(taxTotal).subtract(invoiceDiscount).max(BigDecimal.ZERO);
        Client client = inv.getClient();
        boolean intraState = isIntraState(client.getPlaceOfSupply());
        BigDecimal cgstAmount = intraState ? splitTaxAmount(taxTotal) : BigDecimal.ZERO;
        BigDecimal sgstAmount = intraState ? splitTaxAmount(taxTotal) : BigDecimal.ZERO;
        BigDecimal igstAmount = intraState ? BigDecimal.ZERO : taxTotal;
        Integer cgstPercent = intraState ? splitTaxPercent(gstPercent) : 0;
        Integer sgstPercent = intraState ? splitTaxPercent(gstPercent) : 0;
        Integer igstPercent = intraState ? 0 : gstPercent;

        return InvoiceDto.builder()
                .id(inv.getId()).invoiceNo(inv.getInvoiceNo())
                .orderId(inv.getSalesOrder().getId()).orderNo(inv.getSalesOrder().getOrderNo())
                .clientId(client.getId()).clientName(client.getName())
                .clientGstNo(client.getGstNo())
                .clientBillingAddress(client.getBillingAddress())
                .clientShippingAddress(client.getShippingAddress())
                .clientAddress(preferredClientAddress(client))
                .placeOfSupply(client.getPlaceOfSupply())
                .invoiceDate(inv.getInvoiceDate() != null ? inv.getInvoiceDate().toString() : null)
                .dueDate(inv.getDueDate() != null ? inv.getDueDate().toString() : null)
                .gstPercent(gstPercent)
                .cgstAmount(cgstAmount).sgstAmount(sgstAmount).igstAmount(igstAmount)
                .cgstPercent(cgstPercent).sgstPercent(sgstPercent).igstPercent(igstPercent)
                .taxMode(intraState ? "INTRA_STATE" : "INTER_STATE")
                .invoiceDiscount(invoiceDiscount).discountTotal(discountTotal).status(inv.getStatus().name())
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

    private Integer resolveSalesQty(SalesOrderLine line) {
        Integer salesQty = line.getSalesQty();
        if (salesQty != null && salesQty > 0) return salesQty;
        return line.getQty() != null ? line.getQty() : 0;
    }

    private BigDecimal defaultDiscount(SalesOrderLine line) {
        return line.getDiscount() != null ? line.getDiscount() : BigDecimal.ZERO;
    }

    private BigDecimal defaultInvoiceDiscount(Invoice invoice) {
        return invoice.getInvoiceDiscount() != null ? invoice.getInvoiceDiscount() : BigDecimal.ZERO;
    }

    private BigDecimal defaultWeightGrams(Product product) {
        return product.getWeightGrams() != null ? product.getWeightGrams() : BigDecimal.ZERO;
    }

    private BigDecimal materialRequiredKg(Product product, Integer qty) {
        return defaultWeightGrams(product)
                .multiply(BigDecimal.valueOf(qty != null ? qty : 0))
                .divide(BigDecimal.valueOf(1000), 3, RoundingMode.HALF_UP);
    }

    private String preferredClientAddress(Client client) {
        if (client.getShippingAddress() != null && !client.getShippingAddress().isBlank()) return client.getShippingAddress();
        return client.getBillingAddress();
    }

    private BigDecimal salesOrderLineBaseAmount(SalesOrderLine line) {
        return line.getUnitPrice().multiply(BigDecimal.valueOf(resolveSalesQty(line)));
    }

    private BigDecimal salesOrderLineDiscountAmount(SalesOrderLine line) {
        return salesOrderLineBaseAmount(line)
                .multiply(defaultDiscount(line))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal salesOrderLineTaxableAmount(SalesOrderLine line) {
        return salesOrderLineBaseAmount(line).subtract(salesOrderLineDiscountAmount(line));
    }

    private boolean isIntraState(String placeOfSupply) {
        if (placeOfSupply == null || placeOfSupply.isBlank()) return true;
        String normalized = placeOfSupply.trim().toUpperCase();
        return normalized.equals(COMPANY_STATE_NAME) || normalized.startsWith(COMPANY_STATE_CODE);
    }

    private BigDecimal splitTaxAmount(BigDecimal totalTax) {
        return (totalTax != null ? totalTax : BigDecimal.ZERO)
                .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
    }

    private Integer splitTaxPercent(Integer totalPercent) {
        return totalPercent == null ? 0 : totalPercent / 2;
    }
}
