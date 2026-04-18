package com.education.klaszo.dto;

import lombok.Data;

@Data
public class PaymentVerificationDTO {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
