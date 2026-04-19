package com.orderflow.repository;

import com.orderflow.model.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    boolean existsByCode(String code);

    @Query("SELECT COALESCE(SUM(c.cyOutstanding), 0) FROM Client c")
    BigDecimal sumCyOutstanding();

    @Query("SELECT COALESCE(SUM(c.pyOutstanding), 0) FROM Client c")
    BigDecimal sumPyOutstanding();
}
