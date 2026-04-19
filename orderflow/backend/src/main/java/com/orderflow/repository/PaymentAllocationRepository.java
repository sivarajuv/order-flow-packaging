package com.orderflow.repository;
import com.orderflow.model.PaymentAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, Long> {
    @Query("SELECT COALESCE(SUM(a.allocatedAmount), 0) FROM PaymentAllocation a WHERE a.invoice.id = :invoiceId")
    BigDecimal sumAllocatedByInvoiceId(@Param("invoiceId") Long invoiceId);
}
