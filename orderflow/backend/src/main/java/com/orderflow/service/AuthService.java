package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.AppUser;
import com.orderflow.model.AppUser.UserRole;
import com.orderflow.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final AppUserRepository userRepo;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    // Simple in-memory session store: token → userId
    private final ConcurrentHashMap<String, Long> sessions = new ConcurrentHashMap<>();
    public UserDto registerFirstUser(CreateUserRequest req) {
        if (userRepo.count() > 0) {
            throw new RuntimeException("Admin already exists. Contact administrator.");
        }

        AppUser user = AppUser.builder()
                .username(req.getUsername())
                .fullName(req.getFullName())
                .passwordHash(bcrypt.encode(req.getPassword()))
                .role(UserRole.ADMIN)   // ✅ FIRST USER = ADMIN
                .active(true)
                .build();

        return toDto(userRepo.save(user));
    }
    // ── Login ──────────────────────────────────────────────
    public LoginResponse login(LoginRequest req) {
        AppUser user = userRepo.findByUsernameIgnoreCase(req.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        if (!user.getActive())
            throw new RuntimeException("Account is disabled");
        if (!bcrypt.matches(req.getPassword(), user.getPasswordHash()))
            throw new RuntimeException("Invalid username or password");

        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());

        return buildResponse(user, token);
    }

    // ── Validate token (called by controller for auth checks) ─
    public AppUser validateToken(String token) {
        if (token == null) return null;
        Long userId = sessions.get(token.replace("Bearer ", "").trim());
        if (userId == null) return null;
        return userRepo.findById(userId).filter(AppUser::getActive).orElse(null);
    }

    // ── Logout ─────────────────────────────────────────────
    public void logout(String token) {
        if (token != null) sessions.remove(token.replace("Bearer ", "").trim());
    }

    // ── Get all users (admin only) ─────────────────────────
    public List<UserDto> getAllUsers() {
        return userRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── Create user (admin only) ───────────────────────────
    public UserDto createUser(CreateUserRequest req) {
        if (userRepo.existsByUsernameIgnoreCase(req.getUsername()))
            throw new RuntimeException("Username already exists: " + req.getUsername());
        if (req.getPassword() == null || req.getPassword().length() < 6)
            throw new RuntimeException("Password must be at least 6 characters");

        AppUser user = AppUser.builder()
                .username(req.getUsername().trim())
                .fullName(req.getFullName() != null ? req.getFullName().trim() : req.getUsername())
                .passwordHash(bcrypt.encode(req.getPassword()))
                .role(parseRole(req.getRole()))
                .active(true)
                .build();
        return toDto(userRepo.save(user));
    }

    // ── Update user role / status (admin only) ─────────────
    public UserDto updateUser(Long id, CreateUserRequest req) {
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        if (req.getFullName() != null) user.setFullName(req.getFullName().trim());
        if (req.getRole() != null) user.setRole(parseRole(req.getRole()));
        // If password is provided by admin, reset it directly (no current password needed)
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            if (req.getPassword().length() < 6) throw new RuntimeException("Password must be at least 6 characters");
            user.setPasswordHash(bcrypt.encode(req.getPassword()));
        }
        return toDto(userRepo.save(user));
    }

    // ── Toggle active/inactive (admin only) ───────────────
    public UserDto setActive(Long id, boolean active) {
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setActive(active);
        // Invalidate all sessions for this user if disabling
        if (!active) sessions.entrySet().removeIf(e -> e.getValue().equals(id));
        return toDto(userRepo.save(user));
    }

    // ── Delete user (admin only, cannot delete self) ───────
    public void deleteUser(Long id, Long requestingUserId) {
        if (id.equals(requestingUserId))
            throw new RuntimeException("Cannot delete your own account");
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        // Check at least one admin remains
        if (user.getRole() == UserRole.ADMIN) {
            long adminCount = userRepo.findAll().stream()
                    .filter(u -> u.getRole() == UserRole.ADMIN && u.getActive() && !u.getId().equals(id))
                    .count();
            if (adminCount == 0) throw new RuntimeException("Cannot delete the last active admin");
        }
        sessions.entrySet().removeIf(e -> e.getValue().equals(id));
        userRepo.deleteById(id);
    }

    // ── Change own password ────────────────────────────────
    public void changePassword(Long userId, ChangePasswordRequest req) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!bcrypt.matches(req.getCurrentPassword(), user.getPasswordHash()))
            throw new RuntimeException("Current password is incorrect");
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6)
            throw new RuntimeException("New password must be at least 6 characters");
        user.setPasswordHash(bcrypt.encode(req.getNewPassword()));
        userRepo.save(user);
    }

    // ── Me (from token) ────────────────────────────────────
    public LoginResponse me(String token) {
        AppUser user = validateToken(token);
        if (user == null) throw new RuntimeException("Invalid or expired session");
        return buildResponse(user, token.replace("Bearer ", "").trim());
    }

    // ── Helpers ────────────────────────────────────────────
    private LoginResponse buildResponse(AppUser u, String token) {
        String initials = buildInitials(u.getFullName());
        return LoginResponse.builder()
                .id(u.getId()).username(u.getUsername())
                .fullName(u.getFullName())
                .role(u.getRole().name())
                .avatar(initials)
                .token(token)
                .build();
    }

    private UserDto toDto(AppUser u) {
        return UserDto.builder()
                .id(u.getId()).username(u.getUsername())
                .fullName(u.getFullName())
                .role(u.getRole().name())
                .active(u.getActive())
                .avatar(buildInitials(u.getFullName()))
                .build();
    }

    private String buildInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "??";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (parts[0].charAt(0) + "" + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    private UserRole parseRole(String role) {
        try { return UserRole.valueOf(role.toUpperCase()); }
        catch (Exception e) { throw new RuntimeException("Invalid role: " + role); }
    }

    // ── Seed default admin (called from DataSeeder) ────────
    public void seedAdminIfNone(String username, String password, String fullName) {
        if (userRepo.count() == 0) {
            userRepo.save(AppUser.builder()
                    .username(username)
                    .fullName(fullName)
                    .passwordHash(bcrypt.encode(password))
                    .role(UserRole.ADMIN)
                    .active(true)
                    .build());
        }
    }
}
