package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.AppUser;
import com.orderflow.model.AppUser.UserRole;
import com.orderflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
private final SalesOrderRepository salesOrderRepository;
private final InvoiceRepository invoiceRepository;
private final ClientRepository clientRepository;
private final PaymentRepository paymentRepository;
public void deleteAll(){
    salesOrderRepository.deleteAll();
    invoiceRepository.deleteAll();
    clientRepository.deleteAll();
    paymentRepository.deleteAll();
}
}
