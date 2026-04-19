package com.orderflow.dto;
import lombok.*;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor
public class ChatRequest {
    private String message;
    private List<HistoryEntry> history;
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class HistoryEntry {
        private String role;
        private String content;
    }
}
