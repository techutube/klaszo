package com.education.klaszo.controller;

import com.education.klaszo.model.Enrollment;
import com.education.klaszo.model.User;
import com.education.klaszo.repository.EnrollmentRepository;
import com.education.klaszo.repository.UserRepository;
import com.education.klaszo.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStorageService fileStorageService;

    @Value("${cloudflare.r2.public-url:}")
    private String publicUrl;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<?> getSubscriptions(@AuthenticationPrincipal User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
        return ResponseEntity.ok(enrollments.stream().map(e -> {
            Map<String, Object> map = Map.of(
                "id", e.getSubject().getId(),
                "title", e.getSubject().getTitle(),
                "description", e.getSubject().getDescription(),
                "enrolledAt", e.getEnrolledAt()
            );
            return map;
        }).collect(Collectors.toList()));
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request
    ) {
        User user = userRepository.findById(currentUser.getId()).orElseThrow();
        
        String name = request.get("name");
        String email = request.get("email");

        if (name != null && !name.trim().isEmpty()) {
            user.setName(name.trim());
        }
        
        if (email != null) {
            String trimmedEmail = email.trim();
            if (!trimmedEmail.isEmpty() && !trimmedEmail.equals(user.getEmail())) {
                user.setEmail(trimmedEmail);
                user.setEmailVerified(false); // Reset verification if email changed
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            User user = userRepository.findById(currentUser.getId()).orElseThrow();
            String fileName = fileStorageService.storeFile(file);
            String imageUrl = publicUrl + "/" + fileName;
            user.setProfileImage(imageUrl);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("profileImage", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload image: " + e.getMessage());
        }
    }
}
