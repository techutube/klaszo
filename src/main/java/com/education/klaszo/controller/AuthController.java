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

    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String phoneNumber = (String) decodedToken.getClaims().get("phone_number");
            String name = (String) decodedToken.getClaims().get("name");

            Optional<User> userOptional = userRepository.findByFirebaseUid(uid);
            User user;

            if (userOptional.isPresent()) {
                user = userOptional.get();
                // Update info if it's newly available from Firebase
                if (email != null && user.getEmail() == null) user.setEmail(email);
                if (phoneNumber != null && user.getPhoneNumber() == null) user.setPhoneNumber(phoneNumber);
                if (name != null && user.getName() == null) user.setName(name);
                userRepository.save(user);
            } else {
                // Create new user skeleton
                user = new User();
                user.setFirebaseUid(uid);
                user.setEmail(email);
                user.setPhoneNumber(phoneNumber);
                user.setName(name);
                user.setRole("STUDENT");
                user = userRepository.save(user);
            }

            String token = jwtService.generateToken(user.getId().toString());
            return ResponseEntity.ok(Map.of("token", token, "user", user));
        } catch (com.google.firebase.auth.FirebaseAuthException e) {
            return ResponseEntity.status(401).body("Invalid Firebase token: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        // This will be used in the step 3 of onboarding
        String firebaseUid = request.get("firebaseUid");
        String name = request.get("name");
        String email = request.get("email");

        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (name != null && !name.trim().isEmpty()) user.setName(name);
        if (email != null) {
            user.setEmail(email.trim().isEmpty() ? null : email);
        }
        
        user = userRepository.save(user);
        String token = jwtService.generateToken(user.getId().toString());
        return ResponseEntity.ok(Map.of("token", token, "user", user));
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

