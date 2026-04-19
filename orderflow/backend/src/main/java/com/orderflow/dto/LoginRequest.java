package com.orderflow.dto;

import lombok.*;
import com.orderflow.model.AppUser;

// ── Login request ─────────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    private String username;
    private String password;
}
