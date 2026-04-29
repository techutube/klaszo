package com.education.klaszo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class ContentItemDTO {
    private UUID id;
    private String title;
    private String contentType;  // "VIDEO" or "PDF"
    private boolean isFree;
    private Integer durationSeconds;
    private String streamUrl;    // only populated if user is enrolled OR item is free
    private String sectionType;
    // storageKey is NEVER sent to frontend
}
