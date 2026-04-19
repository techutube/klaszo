package com.education.klaszo.controller;

import com.education.klaszo.model.User;
import com.education.klaszo.repository.UserRepository;
import com.education.klaszo.security.JwtService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = (String) decodedToken.getClaims().get("name");

            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isPresent()) {
                user = userOptional.get();
                // Update Firebase UID if it changed or wasn't set
                if (!uid.equals(user.getFirebaseUid())) {
                    user.setFirebaseUid(uid);
                    userRepository.save(user);
                }
            } else {
                // Create new user
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setFirebaseUid(uid);
                user.setRole("STUDENT"); // Default role
                user = userRepository.save(user);
            }

            String token = jwtService.generateToken(user.getId().toString());
            return ResponseEntity.ok(Map.of("token", token, "user", user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid Firebase token: " + e.getMessage());
        }
    }

    @PostMapping("/demo-login")
    public ResponseEntity<?> demoLogin() {
        // Fetch any existing user for demo purposes, or create one if none exist
        User user = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail("demo@klaszo.com");
            newUser.setName("Demo Student");
            newUser.setRole("ADMIN");
            newUser.setFirebaseUid("demo-uid-" + System.currentTimeMillis());
            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(user.getId().toString());
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }
}

