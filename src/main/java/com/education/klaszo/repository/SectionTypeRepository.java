package com.education.klaszo.repository;

import com.education.klaszo.model.SectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SectionTypeRepository extends JpaRepository<SectionType, String> {
}
