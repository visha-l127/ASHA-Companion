package com.ashacompanion.repository;

import com.ashacompanion.entity.HealthRiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthRiskAssessmentRepository extends JpaRepository<HealthRiskAssessment, Long> {

    List<HealthRiskAssessment> findByPatientIdOrderByAssessedAtDesc(Long patientId);

    List<HealthRiskAssessment> findByPhcIdOrderByAssessedAtDesc(String phcId);

    List<HealthRiskAssessment> findByRiskLevel(String riskLevel);

    List<HealthRiskAssessment> findByPhcIdAndRiskLevelInOrderByAssessedAtDesc(String phcId, List<String> riskLevels);

    Optional<HealthRiskAssessment> findTopByPatientIdAndAssessmentTypeOrderByAssessedAtDesc(Long patientId, String assessmentType);
}
