package com.orderflow.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobActivityDto {
    private Long id;
    private String activityType;
    private String description;
    private String performedBy;
    private String activityTime;
    private String notes;
}
