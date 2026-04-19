package com.orderflow.dto;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobCardDto {
    private Long id;
    private String jobCardNo;
    private Long orderId;
    private String orderNo;
    private Long orderLineId;
    private Long clientId;
    private String clientName;
    private String salesperson;
    private Long productId;
    private String productName;
    private String sku;
    private String size;
    private String handle;
    private String stereoRef;
    private Integer qty;
    private String spec;
    private String startDate;
    private String dueDate;
    private String status;
    private String instructions;
    private List<String> doneStages;
    private List<JobActivityDto> activities;
    private String areaCode;
}
