package com.orderflow.repository;

import com.orderflow.model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    List<SalesOrder> findByClient_Id(Long clientId);
    List<SalesOrder> findTop5ByOrderByIdDesc();
    long countByStatusIn(List<SalesOrder.OrderStatus> statuses);
}
