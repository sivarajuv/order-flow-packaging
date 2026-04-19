package com.orderflow.repository;

import com.orderflow.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByClient_Id(Long clientId);
    List<Invoice> findByStatusNot(Invoice.InvoiceStatus status);
}
