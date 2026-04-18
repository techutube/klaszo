package com.education.klaszo.repository;

import com.education.klaszo.model.ContentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {
    List<ContentItem> findBySubjectIdOrderByDisplayOrderAsc(UUID subjectId);
}
