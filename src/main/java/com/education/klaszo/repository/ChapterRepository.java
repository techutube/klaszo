package com.education.klaszo.repository;

import com.education.klaszo.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, UUID> {
    List<Chapter> findBySubjectIdOrderByDisplayOrderAsc(UUID subjectId);
}
