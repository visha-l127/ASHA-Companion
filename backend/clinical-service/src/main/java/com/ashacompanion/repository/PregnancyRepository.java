package com.ashacompanion.repository;

import com.ashacompanion.entity.Pregnancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PregnancyRepository extends JpaRepository<Pregnancy, Long> {

    List<Pregnancy> findByPatientId(Long patientId);

    List<Pregnancy> findByPatientAshaWorkerId(Long ashaWorkerId);

    List<Pregnancy> findByPatientPhcId(String phcId);

    List<Pregnancy> findByHighRisk(Integer highRisk);

    List<Pregnancy> findByHighRiskAndPatientPhcId(Integer highRisk, String phcId);

    List<Pregnancy> findByHighRiskAndPatientAshaWorkerId(Integer highRisk, Long ashaWorkerId);
}
