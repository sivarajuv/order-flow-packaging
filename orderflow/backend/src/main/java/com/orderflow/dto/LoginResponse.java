package com.orderflow.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponse {
    private Long id;
    private String username;
    private String fullName;
    private String role;       // ADMIN | SALES | OPERATOR
    private String avatar;     // 2-char initials
    private String token;      // simple session token
}
