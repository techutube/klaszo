package com.education.klaszo.config;

import com.education.klaszo.model.SectionType;
import com.education.klaszo.repository.SectionTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SectionTypeRepository sectionTypeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (sectionTypeRepository.count() == 0) {
            sectionTypeRepository.saveAll(List.of(
                    new SectionType("VIDEO", "Video Lectures"),
                    new SectionType("NOTES", "Revision Notes"),
                    new SectionType("DPP", "Daily Practice Papers (DPP)"),
                    new SectionType("MIND_MAP", "Mind Maps")
            ));
            System.out.println("Default Section Types seeded!");
        }
    }
}
