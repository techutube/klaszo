package com.education.klaszo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {
    private String orderId;
    private int amount;
    private String currency;
    private String keyId;
}
