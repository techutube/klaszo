package com.education.klaszo.controller;

import com.education.klaszo.model.User;
import com.education.klaszo.repository.UserRepository;
import com.education.klaszo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @PostMapping("/demo-login")
    public ResponseEntity<?> demoLogin() {
        // Fetch any existing user for demo purposes, or create one if none exist
        User user = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail("demo@klaszo.com");
            newUser.setName("Demo Student");
            newUser.setFirebaseUid("demo-uid-" + System.currentTimeMillis());
            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(user.getId().toString());
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }
}
