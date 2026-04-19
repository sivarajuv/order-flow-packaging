package com.orderflow.repository;
import com.orderflow.model.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {
    List<JobCard> findByStatus(JobCard.JobCardStatus status);
    long countByStatus(JobCard.JobCardStatus status);
}
