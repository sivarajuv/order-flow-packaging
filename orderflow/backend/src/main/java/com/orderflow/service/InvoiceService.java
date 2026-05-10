package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.*;
import com.orderflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final SalesOrderRepository orderRepo;
    private final ClientRepository clientRepo;
    private final MapperService mapper;

    public List<InvoiceDto> getAll() {
        return invoiceRepo.findAll().stream().map(mapper::toInvoiceDto).collect(Collectors.toList());
    }

    public InvoiceDto getById(Long id) {
        return mapper.toInvoiceDto(invoiceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id)));
    }

    public InvoiceDto create(InvoiceRequest req) {
        SalesOrder order = orderRepo.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + req.getOrderId()));
        Client client = order.getClient();

        // GST: preserve an explicit 0% override instead of falling back to defaults.
        Integer requestedGst = req.getGstOverride();
        int gstPct = requestedGst == null ? client.getGstPercent() : requestedGst.intValue();

        long count = invoiceRepo.count() + 1;
        String invNo = "INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", count);

        LocalDate invDate = req.getInvoiceDate() != null ? LocalDate.parse(req.getInvoiceDate()) : LocalDate.now();
        LocalDate dueDate = req.getDueDate() != null ? LocalDate.parse(req.getDueDate()) : invDate.plusDays(30);

        Invoice invoice = Invoice.builder()
                .invoiceNo(invNo).salesOrder(order).client(client)
                .invoiceDate(invDate).dueDate(dueDate)
                .invoiceDiscount(req.getInvoiceDiscount() != null ? req.getInvoiceDiscount() : BigDecimal.ZERO)
                .gstPercent(gstPct).status(Invoice.InvoiceStatus.UNPAID)
                .lines(new ArrayList<>())
                .build();
        invoice.setGstPercent(gstPct);

        for (SalesOrderLine ol : order.getLines()) {
            InvoiceLine il = InvoiceLine.builder()
                    .invoice(invoice).orderLine(ol)
                    .qty(resolveInvoiceQty(ol)).unitPrice(ol.getUnitPrice())
                    .taxPercent(gstPct)
                    .build();
            il.setTaxPercent(gstPct);
            invoice.getLines().add(il);
        }

        Invoice saved = invoiceRepo.save(invoice);

        // Update order status to INVOICED
        order.setStatus(SalesOrder.OrderStatus.INVOICED);
        orderRepo.save(order);

        // Update client CY outstanding
        BigDecimal lineSubtotal = saved.getLines().stream().map(l -> {
            BigDecimal base = l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQty()));
            BigDecimal discount = base.multiply(resolveDiscountPercent(l))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal taxable = base.subtract(discount);
            return taxable;
        }).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal invoiceDiscount = req.getInvoiceDiscount() != null ? req.getInvoiceDiscount() : BigDecimal.ZERO;
        BigDecimal tax = lineSubtotal.multiply(BigDecimal.valueOf(gstPct))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = lineSubtotal.add(tax).subtract(invoiceDiscount).max(BigDecimal.ZERO);

        client.setCyOutstanding(client.getCyOutstanding().add(total));
        clientRepo.save(client);

        return mapper.toInvoiceDto(invoiceRepo.findById(saved.getId()).orElseThrow());
    }

    public InvoiceDto update(Long id, InvoiceUpdateRequest req) {
        Invoice invoice = invoiceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        BigDecimal oldTotal = calculateInvoiceTotal(invoice);

        if (req.getInvoiceDate() != null && !req.getInvoiceDate().isBlank()) {
            invoice.setInvoiceDate(LocalDate.parse(req.getInvoiceDate()));
        }
        if (req.getDueDate() != null && !req.getDueDate().isBlank()) {
            invoice.setDueDate(LocalDate.parse(req.getDueDate()));
        }
        if (req.getGstPercent() != null) {
            invoice.setGstPercent(req.getGstPercent());
            invoice.getLines().forEach(line -> line.setTaxPercent(req.getGstPercent()));
        }
        if (req.getInvoiceDiscount() != null) {
            invoice.setInvoiceDiscount(req.getInvoiceDiscount().max(BigDecimal.ZERO));
        }

        syncInvoiceStatus(invoice);

        BigDecimal newTotal = calculateInvoiceTotal(invoice);
        BigDecimal delta = newTotal.subtract(oldTotal);
        Client client = invoice.getClient();
        client.setCyOutstanding(client.getCyOutstanding().add(delta).max(BigDecimal.ZERO));
        clientRepo.save(client);

        Invoice saved = invoiceRepo.save(invoice);
        return mapper.toInvoiceDto(saved);
    }

    private int resolveInvoiceQty(SalesOrderLine orderLine) {
        Integer salesQty = orderLine.getSalesQty();
        if (salesQty != null && salesQty > 0) return salesQty;
        return orderLine.getQty() != null ? orderLine.getQty() : 0;
    }

    private BigDecimal resolveDiscountPercent(InvoiceLine line) {
        SalesOrderLine orderLine = line.getOrderLine();
        if (orderLine == null || orderLine.getDiscount() == null) return BigDecimal.ZERO;
        return orderLine.getDiscount();
    }

    private BigDecimal calculateInvoiceTotal(Invoice invoice) {
        BigDecimal lineSubtotal = invoice.getLines().stream().map(l -> {
            BigDecimal base = l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQty()));
            BigDecimal discount = base.multiply(resolveDiscountPercent(l))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return base.subtract(discount);
        }).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gstPercent = BigDecimal.valueOf(invoice.getGstPercent() != null ? invoice.getGstPercent() : 0);
        BigDecimal invoiceDiscount = invoice.getInvoiceDiscount() != null ? invoice.getInvoiceDiscount() : BigDecimal.ZERO;
        BigDecimal tax = lineSubtotal.multiply(gstPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        return lineSubtotal.add(tax).subtract(invoiceDiscount).max(BigDecimal.ZERO);
    }

    private void syncInvoiceStatus(Invoice invoice) {
        BigDecimal paid = invoice.getAllocations() == null
                ? BigDecimal.ZERO
                : invoice.getAllocations().stream()
                .map(PaymentAllocation::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = calculateInvoiceTotal(invoice);

        if (paid.compareTo(total) >= 0 && total.compareTo(BigDecimal.ZERO) >= 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
        } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
        } else {
            invoice.setStatus(Invoice.InvoiceStatus.UNPAID);
        }
    }
}
