package com.education.klaszo.repository;

import com.education.klaszo.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findAllByOrderByTitleAsc();
    Optional<Course> findBySlug(String slug);
}
