package com.orderflow.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatResponse {
    private String reply;
    private boolean success;
}
