package com.education.klaszo.controller;

import com.education.klaszo.model.ContentItem;
import com.education.klaszo.model.Subject;
import com.education.klaszo.model.Course;
import com.education.klaszo.repository.ContentItemRepository;
import com.education.klaszo.repository.SubjectRepository;
import com.education.klaszo.repository.CourseRepository;
import com.education.klaszo.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
public class AdminContentController {

    private final ContentItemRepository contentItemRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final com.education.klaszo.repository.ChapterRepository chapterRepository;
    private final FileStorageService fileStorageService;

    @PostMapping("/chapters")
    public ResponseEntity<?> createChapter(@RequestBody com.education.klaszo.model.Chapter chapter) {
        return ResponseEntity.ok(chapterRepository.save(chapter));
    }

    @GetMapping("/subjects/{subjectId}/chapters")
    public ResponseEntity<?> getChapters(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(chapterRepository.findBySubjectIdOrderByDisplayOrderAsc(subjectId));
    }

    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable UUID id, @RequestBody Course courseDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        if (courseDetails.getThumbnailUrl() != null) {
            course.setThumbnailUrl(courseDetails.getThumbnailUrl());
        }
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable UUID id, @RequestBody Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        subject.setTitle(subjectDetails.getTitle());
        subject.setDescription(subjectDetails.getDescription());
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadContent(
            @RequestParam("file") MultipartFile file,
            @RequestParam("subjectId") UUID subjectId,
            @RequestParam(value = "chapterId", required = false) UUID chapterId,
            @RequestParam("title") String title,
            @RequestParam("contentType") String contentType,
            @RequestParam(value = "sectionType", defaultValue = "NOTES") String sectionType,
            @RequestParam(value = "pricePaise", defaultValue = "0") Integer pricePaise,
            @RequestParam(value = "displayOrder", defaultValue = "0") int displayOrder
    ) {
        try {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

            String fileName = fileStorageService.storeFile(file);

            ContentItem contentItem = new ContentItem();
            contentItem.setSubject(subject);
            
            if (chapterId != null) {
                com.education.klaszo.model.Chapter chapter = chapterRepository.findById(chapterId)
                        .orElseThrow(() -> new IllegalArgumentException("Chapter not found"));
                contentItem.setChapter(chapter);
            }

            contentItem.setTitle(title);
            contentItem.setContentType(contentType);
            contentItem.setSectionType(sectionType);
            contentItem.setStorageKey(fileName);
            contentItem.setPricePaise(pricePaise);
            contentItem.setDisplayOrder(displayOrder);
            contentItem.setFree(pricePaise == 0);

            contentItemRepository.save(contentItem);

            // Recalculate Subject Total Price
            List<ContentItem> items = contentItemRepository.findBySubjectIdOrderByDisplayOrderAsc(subjectId);
            int totalSubjectPrice = items.stream()
                    .mapToInt(item -> item.getPricePaise() != null ? item.getPricePaise() : 0)
                    .sum();
            
            subject.setPricePaise(totalSubjectPrice);
            subjectRepository.save(subject);

            return ResponseEntity.ok(contentItem);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to store file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
