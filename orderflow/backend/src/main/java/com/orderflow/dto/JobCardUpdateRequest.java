package com.orderflow.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCardUpdateRequest {
    private String instructions;
    private String startDate;
    private String dueDate;
}