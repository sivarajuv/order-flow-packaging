package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.*;
import com.orderflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ClientRepository clientRepo;
    private final SalesOrderRepository orderRepo;
    private final InvoiceRepository invoiceRepo;
    private final JobCardRepository jcRepo;
    private final MapperService mapper;

    public DashboardDto getDashboard() {
        BigDecimal totalCY = clientRepo.sumCyOutstanding();
        BigDecimal totalPY = clientRepo.sumPyOutstanding();

        long openOrders = orderRepo.countByStatusIn(
                List.of(SalesOrder.OrderStatus.NEW, SalesOrder.OrderStatus.IN_PRODUCTION));
        long activeJobs = jcRepo.countByStatus(JobCard.JobCardStatus.IN_PRODUCTION);

        long overdueInvoices = invoiceRepo.findByStatusNot(Invoice.InvoiceStatus.PAID).stream()
                .filter(i -> i.getDueDate() != null && i.getDueDate().isBefore(LocalDate.now()))
                .count();

        List<JobCardDto> activeJobCards = jcRepo.findByStatus(JobCard.JobCardStatus.IN_PRODUCTION)
                .stream().map(mapper::toJobCardDto).collect(Collectors.toList());

        // Also include PENDING job cards on dashboard
        List<JobCardDto> pendingJobCards = jcRepo.findByStatus(JobCard.JobCardStatus.PENDING)
                .stream().map(mapper::toJobCardDto).collect(Collectors.toList());
        activeJobCards.addAll(pendingJobCards);

        List<InvoiceDto> unpaidInvoices = invoiceRepo.findByStatusNot(Invoice.InvoiceStatus.PAID)
                .stream().map(mapper::toInvoiceDto).collect(Collectors.toList());

        List<ClientDto> clientSummary = clientRepo.findAll().stream()
                .map(mapper::toClientDto).collect(Collectors.toList());

        return DashboardDto.builder()
                .totalCyOutstanding(totalCY != null ? totalCY : BigDecimal.ZERO)
                .totalPyOutstanding(totalPY != null ? totalPY : BigDecimal.ZERO)
                .openOrders((int) openOrders)
                .activeJobs((int) activeJobs)
                .overdueInvoices((int) overdueInvoices)
                .activeJobCards(activeJobCards)
                .unpaidInvoices(unpaidInvoices)
                .clientSummary(clientSummary)
                .build();
    }
}
