package com.orderflow.controller;

import com.orderflow.dto.*;
import com.orderflow.model.AppUser;
import com.orderflow.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserRequest req) {
        try {
            return ResponseEntity.ok(authService.registerFirstUser(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    // ── Public: login ──────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            return ResponseEntity.ok(authService.login(req));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    // ── Public: logout ─────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    // ── Public: me (validate session, refresh user info) ───
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            return ResponseEntity.ok(authService.me(token));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    // ── Change own password (any authenticated user) ───────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody ChangePasswordRequest req) {
        try {
            AppUser caller = authService.validateToken(token);
            if (caller == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorised"));
            authService.changePassword(caller.getId(), req);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Admin: list all users ──────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestHeader("Authorization") String token) {
        if (!isAdmin(token)) return forbidden();
        return ResponseEntity.ok(authService.getAllUsers());
    }

    // ── Admin: create user ─────────────────────────────────
    @PostMapping("/users")
    public ResponseEntity<?> createUser(
            @RequestHeader("Authorization") String token,
            @RequestBody CreateUserRequest req) {
        if (!isAdmin(token)) return forbidden();
        try {
            return ResponseEntity.ok(authService.createUser(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Admin: update user (name, role, password reset) ────
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody CreateUserRequest req) {
        if (!isAdmin(token)) return forbidden();
        try {
            return ResponseEntity.ok(authService.updateUser(id, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Admin: enable / disable user ──────────────────────
    @PutMapping("/users/{id}/active")
    public ResponseEntity<?> setActive(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        if (!isAdmin(token)) return forbidden();
        try {
            return ResponseEntity.ok(authService.setActive(id, body.getOrDefault("active", true)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Admin: delete user ─────────────────────────────────
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        AppUser caller = authService.validateToken(token);
        if (caller == null || caller.getRole() != com.orderflow.model.AppUser.UserRole.ADMIN)
            return forbidden();
        try {
            authService.deleteUser(id, caller.getId());
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Helpers ────────────────────────────────────────────
    private boolean isAdmin(String token) {
        AppUser u = authService.validateToken(token);
        return u != null && u.getRole() == com.orderflow.model.AppUser.UserRole.ADMIN;
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
    }

}
