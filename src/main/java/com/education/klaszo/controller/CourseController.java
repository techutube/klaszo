package com.education.klaszo.controller;

import com.education.klaszo.dto.ContentItemDTO;
import com.education.klaszo.dto.CourseDTO;
import com.education.klaszo.dto.SubjectDTO;
import com.education.klaszo.model.User;
import com.education.klaszo.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")   // you'll tighten this to your Vercel URL later
public class CourseController {

    private final CourseService courseService;

    // Helper to get the logged-in user from the JWT (null if not logged in)
    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return null;
    }

    // GET /api/courses
    @GetMapping("/courses")
    public ResponseEntity<List<CourseDTO>> getCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // GET /api/courses/{courseId}/subjects
    @GetMapping("/courses/{courseId}/subjects")
    public ResponseEntity<List<SubjectDTO>> getSubjects(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.getSubjectsForCourse(courseId, currentUserId()));
    }

    // GET /api/subjects/{subjectId}/content
    @GetMapping("/subjects/{subjectId}/content")
    public ResponseEntity<List<com.education.klaszo.dto.ChapterDTO>> getContent(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(courseService.getContentForSubject(subjectId, currentUserId()));
    }
}
