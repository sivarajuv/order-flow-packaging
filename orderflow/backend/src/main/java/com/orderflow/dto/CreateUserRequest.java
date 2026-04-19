package com.orderflow.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateUserRequest {
    private String username;
    private String password;
    private String fullName;
    private String role;    // ADMIN | SALES | OPERATOR
}
