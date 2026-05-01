package com.education.klaszo.controller;

import com.education.klaszo.dto.PaymentRequestDTO;
import com.education.klaszo.dto.PaymentResponseDTO;
import com.education.klaszo.dto.PaymentVerificationDTO;
import com.education.klaszo.model.User;
import com.education.klaszo.service.PaymentService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@AuthenticationPrincipal User user,
                                         @RequestBody PaymentRequestDTO request) {
        try {
            PaymentResponseDTO response = paymentService.createOrder(user, request);
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationDTO request) {
        boolean isVerified = paymentService.verifyPayment(request);
        if (isVerified) {
            return ResponseEntity.ok("Payment successful and verified");
        } else {
            return ResponseEntity.badRequest().body("Payment verification failed");
        }
    }
}
