package com.education.klaszo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
@Entity @Table(name = "subjects")
@Data @NoArgsConstructor @AllArgsConstructor
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private String title;

    @Column(unique = true)
    private String slug;

    private String description;

    @Column(name = "price_paise", nullable = false)
    private Integer pricePaise;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (pricePaise == null) {
            pricePaise = 0;
        }
        if (displayOrder == null) {
            displayOrder = 0;
        }
        if (slug == null || slug.trim().isEmpty()) {
            generateSlug();
        }
    }

    @jakarta.persistence.PreUpdate
    protected void onUpdate() {
        if (slug == null || slug.trim().isEmpty()) {
            generateSlug();
        }
    }

    private void generateSlug() {
        if (this.title != null) {
            this.slug = this.title.toLowerCase()
                    .replaceAll("[^a-z0-9\\s]", "")
                    .replaceAll("\\s+", "-");
        }
    }
}
