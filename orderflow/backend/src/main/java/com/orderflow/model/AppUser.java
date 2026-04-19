package com.orderflow.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "app_users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.SALES;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    public enum UserRole { ADMIN, SALES, OPERATOR }
}
