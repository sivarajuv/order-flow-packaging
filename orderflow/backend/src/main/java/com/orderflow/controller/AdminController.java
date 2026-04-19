package com.orderflow.controller;

import com.orderflow.dto.ChangePasswordRequest;
import com.orderflow.dto.CreateUserRequest;
import com.orderflow.dto.LoginRequest;
import com.orderflow.model.AppUser;
import com.orderflow.service.AdminService;
import com.orderflow.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    @DeleteMapping("/admin/delete-all")
    public ResponseEntity<?> deleteAll(@RequestHeader(value = "Authorization", required = false) String token) {
        AppUser caller = authService.validateToken(token);
        if (caller == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }
        if (caller.getRole() != AppUser.UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        adminService.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All entries deleted"));
    }
}
