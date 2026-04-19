package com.orderflow.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ChangePasswordRequest {
    private String currentPassword;   // required for own password change
    private String newPassword;
}
