package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_activities")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class JobActivity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_card_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private JobCard jobCard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType activityType;

    private String description;
    private Integer qty;
    private String performedBy;

    @Builder.Default
    private LocalDateTime activityTime = LocalDateTime.now();

    private String notes;

    public enum ActivityType {
        STEREO_AVAILABLE,
        MATERIAL,
        CUTTING,
        PRINTING,
        STITCHING,
        HANDLE,
        QC_CHECK_PACKING,
        DELIVERY
    }
}
