package com.ashacompanion.clinical;

import com.ashacompanion.entity.Vaccine;
import com.ashacompanion.repository.VaccineRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.ashacompanion")
@EntityScan(basePackages = "com.ashacompanion.entity")
@EnableJpaRepositories(basePackages = "com.ashacompanion.repository")
public class ClinicalServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicalServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initClinicalDatabase(VaccineRepository vaccineRepository) {
        return args -> {
            // Seed default vaccines catalog
            seedVaccine(vaccineRepository, "BCG", "Bacillus Calmette-Guérin", 1, "At birth");
            seedVaccine(vaccineRepository, "OPV", "Oral Polio Vaccine", 3, "Birth, 6 weeks, 10 weeks, 14 weeks");
            seedVaccine(vaccineRepository, "HEPB", "Hepatitis B Vaccine", 1, "At birth");
            seedVaccine(vaccineRepository, "PENTA", "Pentavalent Vaccine", 3, "6 weeks, 10 weeks, 14 weeks");
            seedVaccine(vaccineRepository, "ROTA", "Rotavirus Vaccine", 3, "6 weeks, 10 weeks, 14 weeks");
            seedVaccine(vaccineRepository, "PCV", "Pneumococcal Conjugate Vaccine", 3, "6 weeks, 14 weeks, 9 months");
            seedVaccine(vaccineRepository, "IPV", "Inactivated Polio Vaccine", 2, "6 weeks, 14 weeks");
            seedVaccine(vaccineRepository, "MR", "Measles-Rubella Vaccine", 2, "9 months, 16-24 months");
            seedVaccine(vaccineRepository, "DPT", "Diphtheria, Pertussis, and Tetanus Vaccine", 2, "16-24 months, 5-6 years");
        };
    }

    private void seedVaccine(VaccineRepository vaccineRepository, String code, String name, Integer doseNumber, String recommendedAge) {
        if (!vaccineRepository.existsByCode(code)) {
            Vaccine vaccine = new Vaccine(code, name, doseNumber, recommendedAge);
            vaccineRepository.save(vaccine);
            System.out.println("Seeded vaccine: " + code);
        }
    }
}
