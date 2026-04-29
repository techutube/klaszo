package com.education.klaszo.repository;

import com.education.klaszo.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findByCourseIdOrderByDisplayOrderAsc(UUID courseId);
    Optional<Subject> findBySlug(String slug);
}
