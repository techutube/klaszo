package com.education.klaszo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class SubjectDTO {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String courseTitle;
    private int pricePaise;
    private boolean enrolled;   // true if the logged-in user has paid
}
