package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_cards")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class JobCard {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String jobCardNo;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_line_id", nullable = false)
    private SalesOrderLine orderLine;

    private LocalDate startDate;
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobCardStatus status = JobCardStatus.PENDING;

    private String instructions;

    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("activityTime ASC")
    @Builder.Default
    private List<JobActivity> activities = new ArrayList<>();

    public enum JobCardStatus { PENDING, IN_PRODUCTION, COMPLETED, CANCELLED }
}
