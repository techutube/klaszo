package com.education.klaszo.controller;

import com.education.klaszo.model.ContentItem;
import com.education.klaszo.model.Subject;
import com.education.klaszo.repository.ContentItemRepository;
import com.education.klaszo.repository.SubjectRepository;
import com.education.klaszo.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminContentController {

    private final ContentItemRepository contentItemRepository;
    private final SubjectRepository subjectRepository;
    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadContent(
            @RequestParam("file") MultipartFile file,
            @RequestParam("subjectId") UUID subjectId,
            @RequestParam("title") String title,
            @RequestParam("contentType") String contentType,
            @RequestParam(value = "isFree", defaultValue = "false") boolean isFree,
            @RequestParam(value = "displayOrder", defaultValue = "0") int displayOrder
    ) {
        try {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

            String fileName = fileStorageService.storeFile(file);

            ContentItem contentItem = new ContentItem();
            contentItem.setSubject(subject);
            contentItem.setTitle(title);
            contentItem.setContentType(contentType);
            contentItem.setStorageKey(fileName);
            contentItem.setFree(isFree);
            contentItem.setDisplayOrder(displayOrder);

            ContentItem savedItem = contentItemRepository.save(contentItem);
            return ResponseEntity.ok(savedItem);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to store file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
