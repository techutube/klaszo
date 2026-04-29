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

@Entity @Table(name = "content_items")
@Data @NoArgsConstructor @AllArgsConstructor
public class ContentItem {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;

    private String title;

    @Column(name = "content_type")
    private String contentType;   // "VIDEO" or "PDF"

    @Column(name = "section_type")
    private String sectionType;   // "NOTES", "DPP", "MIND_MAP", "VIDEO"

    @Column(name = "storage_key")
    private String storageKey;    // Cloudflare video ID or R2 key

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "is_free")
    private boolean isFree = false;

    @Column(name = "price_paise")
    private Integer pricePaise = 0;

    @Column(name = "display_order")
    private int displayOrder;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (pricePaise == null) {
            pricePaise = 0;
        }
        // If price is 0, mark as free automatically
        if (pricePaise == 0) {
            isFree = true;
        } else {
            isFree = false;
        }
    }
}
