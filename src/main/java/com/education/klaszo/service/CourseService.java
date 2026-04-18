package com.education.klaszo.service;

import com.education.klaszo.dto.ContentItemDTO;
import com.education.klaszo.dto.CourseDTO;
import com.education.klaszo.dto.SubjectDTO;
import com.education.klaszo.model.ContentItem;
import com.education.klaszo.repository.ContentItemRepository;
import com.education.klaszo.repository.CourseRepository;
import com.education.klaszo.repository.EnrollmentRepository;
import com.education.klaszo.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final ContentItemRepository contentItemRepository;
    private final EnrollmentRepository enrollmentRepository;

    @org.springframework.beans.factory.annotation.Value("${cloudflare.r2.public-url}")
    private String publicUrl;

    // All courses — public, no login needed
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAllByOrderByTitleAsc()
                .stream()
                .map(c -> new CourseDTO(c.getId(), c.getTitle(),
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
                    return new SubjectDTO(s.getId(), s.getTitle(),
                            s.getDescription(), s.getPricePaise(), enrolled);
                })
                .collect(Collectors.toList());
    }

    // Content list for a subject
    // - Free items: streamUrl always included
    // - Paid items: streamUrl only included if user is enrolled
    public List<ContentItemDTO> getContentForSubject(UUID subjectId, UUID userId) {
        boolean isEnrolled = userId != null &&
                enrollmentRepository.existsByUserIdAndSubjectId(userId, subjectId);

        return contentItemRepository.findBySubjectIdOrderByDisplayOrderAsc(subjectId)
                .stream()
                .map(item -> {
                    ContentItemDTO dto = new ContentItemDTO();
                    dto.setId(item.getId());
                    dto.setTitle(item.getTitle());
                    dto.setContentType(item.getContentType());
                    dto.setFree(item.isFree());
                    dto.setDurationSeconds(item.getDurationSeconds());

                    // Only give the actual URL if user can access it
                    if (item.isFree() || isEnrolled) {
                        dto.setStreamUrl(buildStreamUrl(item));
                    }
                    // otherwise streamUrl stays null → frontend shows lock icon

                    return dto;
                })
                .collect(Collectors.toList());
    }

    private String buildStreamUrl(ContentItem item) {
        String baseUrl = publicUrl;
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        return baseUrl + item.getStorageKey();
    }
}
