package com.ashacompanion.repository;

import com.ashacompanion.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByAshaWorkerId(Long ashaWorkerId);

    List<Patient> findByPhcId(String phcId);
}
