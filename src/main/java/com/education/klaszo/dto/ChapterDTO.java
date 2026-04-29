package com.education.klaszo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterDTO {
    private UUID id;
    private String title;
    private String description;
    private Map<String, List<ContentItemDTO>> sections;
}
