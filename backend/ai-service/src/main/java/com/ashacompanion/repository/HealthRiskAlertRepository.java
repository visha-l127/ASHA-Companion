package com.ashacompanion.repository;

import com.ashacompanion.entity.HealthRiskAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthRiskAlertRepository extends JpaRepository<HealthRiskAlert, Long> {

    List<HealthRiskAlert> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<HealthRiskAlert> findByPhcIdOrderByCreatedAtDesc(String phcId);

    List<HealthRiskAlert> findBySeverityOrderByCreatedAtDesc(String severity);

    List<HealthRiskAlert> findByPhcIdAndAcknowledgedOrderByCreatedAtDesc(String phcId, Integer acknowledged);

    List<HealthRiskAlert> findByPatientIdAndAcknowledgedOrderByCreatedAtDesc(Long patientId, Integer acknowledged);

    List<HealthRiskAlert> findByAcknowledgedOrderByCreatedAtDesc(Integer acknowledged);

    long countByPhcIdAndAcknowledged(String phcId, Integer acknowledged);

    boolean existsByPatientIdAndAlertTypeAndAcknowledged(Long patientId, String alertType, Integer acknowledged);

    boolean existsByPhcIdAndAlertTypeAndAcknowledged(String phcId, String alertType, Integer acknowledged);
}
