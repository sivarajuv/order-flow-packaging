package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.*;
import com.orderflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import com.orderflow.dto.OrderLineUpdateRequest;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesOrderService {

    private final SalesOrderRepository orderRepo;
    private final ClientRepository clientRepo;
    private final ClientProductRepository cpRepo;
    private final JobCardRepository jcRepo;
    private final MapperService mapper;

    public List<SalesOrderDto> getAll() {
        return orderRepo.findAll().stream().map(mapper::toSalesOrderDto).collect(Collectors.toList());
    }

    public SalesOrderDto getById(Long id) {
        return mapper.toSalesOrderDto(orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id)));
    }

    public SalesOrderDto create(SalesOrderRequest req) {
        Client client = clientRepo.findById(req.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found: " + req.getClientId()));

        // Generate order number
        long count = orderRepo.count() + 1;
        String orderNo = "SO-" + LocalDate.now().getYear() + "-" + String.format("%04d", count);

        SalesOrder order = SalesOrder.builder()
                .orderNo(orderNo).client(client)
                .orderDate(req.getOrderDate() != null ? LocalDate.parse(req.getOrderDate()) : LocalDate.now())
                .deliveryDate(req.getDeliveryDate() != null ? LocalDate.parse(req.getDeliveryDate()) : null)
                .status(SalesOrder.OrderStatus.NEW)
                .notes(req.getNotes())
                .lines(new ArrayList<>())
                .build();

        // Build lines
        for (SalesOrderRequest.LineRequest lr : req.getLines()) {
            ClientProduct cp = cpRepo.findById(lr.getClientProductId())
                    .orElseThrow(() -> new RuntimeException("Client product not found: " + lr.getClientProductId()));
            SalesOrderLine line = SalesOrderLine.builder()
                    .salesOrder(order).clientProduct(cp)
                    .qty(lr.getQty()).unitPrice(lr.getUnitPrice()).spec(lr.getSpec())
                    .build();
            order.getLines().add(line);
        }

        SalesOrder saved = orderRepo.save(order);

        // Auto-create one job card per line
        int idx = 1;
        for (SalesOrderLine line : saved.getLines()) {
            String jcNo = "JC-" + LocalDate.now().getYear() + "-" + String.format("%04d", count) + "-" + String.format("%02d", idx++);
            JobCard jc = JobCard.builder()
                    .jobCardNo(jcNo).orderLine(line)
                    .startDate(saved.getOrderDate())
                    .dueDate(saved.getDeliveryDate())
                    .status(JobCard.JobCardStatus.PENDING)
                    .instructions(line.getClientProduct().getSpecialSpec())
                    .build();
            jcRepo.save(jc);
        }

        return mapper.toSalesOrderDto(orderRepo.findById(saved.getId()).orElseThrow());
    }

    public SalesOrderDto updateStatus(Long id, String status) {
        SalesOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        SalesOrder.OrderStatus newStatus = SalesOrder.OrderStatus.valueOf(status);
        order.setStatus(newStatus);

        // When starting production, activate pending job cards
        if (newStatus == SalesOrder.OrderStatus.IN_PRODUCTION) {
            order.getLines().forEach(line -> {
                if (line.getJobCard() != null && line.getJobCard().getStatus() == JobCard.JobCardStatus.PENDING) {
                    line.getJobCard().setStatus(JobCard.JobCardStatus.IN_PRODUCTION);
                }
            });
        }

        return mapper.toSalesOrderDto(orderRepo.save(order));
    }
    // Update order header fields (dates, notes) — lines are managed separately
    public SalesOrderDto update(Long id, SalesOrderRequest req) {
        SalesOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        if (req.getOrderDate() != null) order.setOrderDate(LocalDate.parse(req.getOrderDate()));
        if (req.getDeliveryDate() != null && !req.getDeliveryDate().isEmpty())
            order.setDeliveryDate(LocalDate.parse(req.getDeliveryDate()));
        if (req.getNotes() != null) order.setNotes(req.getNotes());
        return mapper.toSalesOrderDto(orderRepo.save(order));
    }
    public SalesOrderDto updateLine(Long orderId, Long lineId, OrderLineUpdateRequest req) {
        SalesOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        SalesOrderLine line = order.getLines().stream()
                .filter(l -> l.getId().equals(lineId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Line not found: " + lineId));
        if (req.getQty() != null) line.setQty(req.getQty());
        if (req.getUnitPrice() != null) line.setUnitPrice(req.getUnitPrice());
        if (req.getSpec() != null) line.setSpec(req.getSpec());
        return mapper.toSalesOrderDto(orderRepo.save(order));
    }

    public void deleteOrder(Long id) {
        if (!orderRepo.existsById(id)) {
            throw new RuntimeException("Order not found");
        }
        orderRepo.deleteById(id);
    }

}


