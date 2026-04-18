package com.education.klaszo.service;

import com.education.klaszo.dto.PaymentRequestDTO;
import com.education.klaszo.dto.PaymentResponseDTO;
import com.education.klaszo.dto.PaymentVerificationDTO;
import com.education.klaszo.model.Payment;
import com.education.klaszo.model.Subject;
import com.education.klaszo.model.User;
import com.education.klaszo.repository.PaymentRepository;
import com.education.klaszo.repository.SubjectRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final SubjectRepository subjectRepository;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Transactional
    public PaymentResponseDTO createOrder(User user, PaymentRequestDTO request) throws RazorpayException {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        int amountInPaise = subject.getPricePaise();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(orderRequest);

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setSubject(subject);
        payment.setRazorpayOrderId(order.get("id"));
        payment.setAmountPaise(amountInPaise);
        payment.setStatus("CREATED");
        paymentRepository.save(payment);

        return PaymentResponseDTO.builder()
                .orderId(order.get("id"))
                .amount(amountInPaise)
                .currency("INR")
                .keyId(keyId)
                .build();
    }

    @Transactional
    public boolean verifyPayment(PaymentVerificationDTO verificationRequest) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", verificationRequest.getRazorpayOrderId());
            options.put("razorpay_payment_id", verificationRequest.getRazorpayPaymentId());
            options.put("razorpay_signature", verificationRequest.getRazorpaySignature());

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, keySecret);

            if (isSignatureValid) {
                Payment payment = paymentRepository.findByRazorpayOrderId(verificationRequest.getRazorpayOrderId())
                        .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

                payment.setRazorpayPaymentId(verificationRequest.getRazorpayPaymentId());
                payment.setStatus("SUCCESS");
                paymentRepository.save(payment);
                
                // Here you would also grant the user access to the subject content
                // e.g., create an Enrollment record

                return true;
            } else {
                Payment payment = paymentRepository.findByRazorpayOrderId(verificationRequest.getRazorpayOrderId()).orElse(null);
                if (payment != null) {
                    payment.setStatus("FAILED");
                    paymentRepository.save(payment);
                }
                return false;
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
            return false;
        }
    }
}
