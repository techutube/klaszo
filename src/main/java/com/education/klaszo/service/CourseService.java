package com.education.klaszo.service;

import com.education.klaszo.dto.ContentItemDTO;
import com.education.klaszo.dto.CourseDTO;
import com.education.klaszo.dto.SubjectDTO;
import com.education.klaszo.dto.ChapterDTO;
import com.education.klaszo.model.ContentItem;
import com.education.klaszo.model.Chapter;
import com.education.klaszo.repository.ContentItemRepository;
import com.education.klaszo.repository.CourseRepository;
import com.education.klaszo.repository.EnrollmentRepository;
import com.education.klaszo.repository.SubjectRepository;
import com.education.klaszo.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final ContentItemRepository contentItemRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ChapterRepository chapterRepository;

    @org.springframework.beans.factory.annotation.Value("${cloudflare.r2.public-url}")
    private String publicUrl;

    public CourseDTO getCourseBySlug(String slug) {
        return courseRepository.findBySlug(slug)
                .map(c -> new CourseDTO(c.getId(), c.getTitle(), c.getSlug(),
                        c.getDescription(), c.getThumbnailUrl()))
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    public SubjectDTO getSubjectBySlug(String slug, UUID userId) {
        com.education.klaszo.model.Subject s = subjectRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        
        boolean enrolled = userId != null &&
                enrollmentRepository.existsByUserIdAndSubjectId(userId, s.getId());
        
        return new SubjectDTO(s.getId(), s.getTitle(), s.getSlug(),
                s.getDescription(), s.getCourse().getTitle(), s.getPricePaise(), enrolled);
    }

    // All courses — public, no login needed
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAllByOrderByTitleAsc()
                .stream()
                .map(c -> new CourseDTO(c.getId(), c.getTitle(), c.getSlug(),
                        c.getDescription(), c.getThumbnailUrl()))
                .collect(Collectors.toList());
    }

    // Subjects in a course — shows enrolled=true/false based on user
    public List<SubjectDTO> getSubjectsForCourse(UUID courseId, UUID userId) {
        return subjectRepository.findByCourseIdOrderByDisplayOrderAsc(courseId)
                .stream()
                .map(s -> {
                    boolean enrolled = userId != null &&
                            enrollmentRepository.existsByUserIdAndSubjectId(userId, s.getId());
                    return new SubjectDTO(s.getId(), s.getTitle(), s.getSlug(),
                            s.getDescription(), s.getCourse().getTitle(), s.getPricePaise(), enrolled);
                })
                .collect(Collectors.toList());
    }

    // Content list for a subject
    // - Free items: streamUrl always included
    // - Paid items: streamUrl only included if user is enrolled
    public List<ChapterDTO> getContentForSubject(UUID subjectId, UUID userId) {
        boolean isEnrolled = userId != null &&
                enrollmentRepository.existsByUserIdAndSubjectId(userId, subjectId);

        List<Chapter> chapters = chapterRepository.findBySubjectIdOrderByDisplayOrderAsc(subjectId);
        List<ContentItem> allItems = contentItemRepository.findBySubjectIdOrderByDisplayOrderAsc(subjectId);

        List<ChapterDTO> result = new ArrayList<>();

        // Group by Chapter
        for (Chapter chapter : chapters) {
            ChapterDTO chapterDTO = new ChapterDTO();
            chapterDTO.setId(chapter.getId());
            chapterDTO.setTitle(chapter.getTitle());
            chapterDTO.setDescription(chapter.getDescription());

            List<ContentItem> chapterItems = allItems.stream()
                    .filter(i -> i.getChapter() != null && i.getChapter().getId().equals(chapter.getId()))
                    .collect(Collectors.toList());

            chapterDTO.setSections(groupItemsBySection(chapterItems, isEnrolled));
            result.add(chapterDTO);
        }

        // Handle items with NO chapter (Uncategorized)
        List<ContentItem> noChapterItems = allItems.stream()
                .filter(i -> i.getChapter() == null)
                .collect(Collectors.toList());

        if (!noChapterItems.isEmpty()) {
            ChapterDTO uncategorized = new ChapterDTO();
            uncategorized.setTitle("General Content");
            uncategorized.setSections(groupItemsBySection(noChapterItems, isEnrolled));
            result.add(uncategorized);
        }

        return result;
    }

    private Map<String, List<ContentItemDTO>> groupItemsBySection(List<ContentItem> items, boolean isEnrolled) {
        Map<String, List<ContentItemDTO>> grouped = new LinkedHashMap<>();
        
        // Define standard sections to ensure order
        String[] sections = {"VIDEO", "NOTES", "DPP", "MIND_MAP"};
        for (String section : sections) {
            grouped.put(section, new ArrayList<>());
        }

        for (ContentItem item : items) {
            ContentItemDTO dto = new ContentItemDTO();
            dto.setId(item.getId());
            dto.setTitle(item.getTitle());
            dto.setContentType(item.getContentType());
            dto.setSectionType(item.getSectionType());
            dto.setFree(item.isFree());
            dto.setDurationSeconds(item.getDurationSeconds());

            if (item.isFree() || isEnrolled) {
                dto.setStreamUrl(buildStreamUrl(item));
            }

            String sectionKey = item.getSectionType() != null ? item.getSectionType() : item.getContentType();
            grouped.computeIfAbsent(sectionKey, k -> new ArrayList<>()).add(dto);
        }

        // Remove empty sections
        grouped.entrySet().removeIf(entry -> entry.getValue().isEmpty());
        
        return grouped;
    }

    private String buildStreamUrl(ContentItem item) {
        String baseUrl = publicUrl;
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        return baseUrl + item.getStorageKey();
    }
}
