package com.ashacompanion.repository;

import com.ashacompanion.entity.NutritionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NutritionRecordRepository extends JpaRepository<NutritionRecord, Long> {

    List<NutritionRecord> findByPatientIdOrderByMeasurementDateDesc(Long patientId);

    List<NutritionRecord> findByPatientAshaWorkerId(Long ashaWorkerId);

    List<NutritionRecord> findByPatientPhcId(String phcId);

    List<NutritionRecord> findByMeasurementDateBetween(LocalDate start, LocalDate end);

    List<NutritionRecord> findByRiskFlag(Integer riskFlag);

    List<NutritionRecord> findByRiskFlagAndPatientAshaWorkerId(Integer riskFlag, Long ashaWorkerId);

    List<NutritionRecord> findByRiskFlagAndPatientPhcId(Integer riskFlag, String phcId);

    Optional<NutritionRecord> findFirstByPatientIdOrderByMeasurementDateDesc(Long patientId);
}
