package com.orderflow.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class JobActivityRequest {
    private String activityType;
    private String description;
    private Integer qty;
    private String performedBy;
    private String notes;
}
