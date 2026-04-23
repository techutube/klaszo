package com.education.klaszo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "firebase_uid", nullable = false, unique = true)
    private String firebaseUid;

    @Column(unique = true, nullable = true)
    private String email;

    @Column(name = "phone_number", unique = true)
    private String phoneNumber;

    private String name;

    @Column(nullable = false)
    private String role = "STUDENT";

    @Column(name = "is_email_verified")
    private boolean isEmailVerified = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
