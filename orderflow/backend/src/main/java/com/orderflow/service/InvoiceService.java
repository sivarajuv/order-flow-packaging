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
        BigDecimal total = saved.getLines().stream().map(l -> {
            BigDecimal base = l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQty()));
            BigDecimal discount = base.multiply(resolveDiscountPercent(l))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal taxable = base.subtract(discount);
            BigDecimal tax = taxable.multiply(BigDecimal.valueOf(gstPct))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return taxable.add(tax);
        }).reduce(BigDecimal.ZERO, BigDecimal::add);

        client.setCyOutstanding(client.getCyOutstanding().add(total));
        clientRepo.save(client);

        return mapper.toInvoiceDto(invoiceRepo.findById(saved.getId()).orElseThrow());
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
}
