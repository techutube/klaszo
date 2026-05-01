package com.education.klaszo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "section_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionType {
    
    @Id
    private String code; // e.g., "VIDEO", "NOTES", "DPP", "MIND_MAP"
    
    private String title; // e.g., "Video Lectures", "Revision Notes"
}
