package com.education.klaszo.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.client-email}")
    private String clientEmail;

    @Value("${firebase.private-key}")
    private String privateKey;

    @Value("${firebase.private-key-id}")
    private String privateKeyId;

    @Value("${firebase.client-id}")
    private String clientId;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // Clean and fix the private key PEM format
        String formattedKey = privateKey.replace("\\n", "\n")
                                        .replace("\"", "")
                                        .trim();

        // Ensure there are newlines after the header and before the footer
        if (!formattedKey.contains("\n") && formattedKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
            formattedKey = formattedKey.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
                                       .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
        } else if (!formattedKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
            // If headers are missing entirely, add them (unlikely but safe)
            formattedKey = "-----BEGIN PRIVATE KEY-----\n" + formattedKey + "\n-----END PRIVATE KEY-----";
        }

        // Reconstruct the JSON string with ALL required fields
        String jsonConfig = String.format(
            "{\n" +
            "  \"type\": \"service_account\",\n" +
            "  \"project_id\": \"%s\",\n" +
            "  \"private_key_id\": \"%s\",\n" +
            "  \"private_key\": \"%s\",\n" +
            "  \"client_email\": \"%s\",\n" +
            "  \"client_id\": \"%s\"\n" +
            "}",
            projectId, privateKeyId, formattedKey.replace("\n", "\\n"), clientEmail, clientId
        );

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(jsonConfig.getBytes(StandardCharsets.UTF_8))))
                .setProjectId(projectId)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.initializeApp(options);
        } else {
            return FirebaseApp.getInstance();
        }
    }
}




