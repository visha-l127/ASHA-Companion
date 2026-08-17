package com.ashacompanion.repository;

import com.ashacompanion.entity.ImmunizationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImmunizationRecordRepository extends JpaRepository<ImmunizationRecord, Long> {

    List<ImmunizationRecord> findByPatientId(Long patientId);

    List<ImmunizationRecord> findByPatientAshaWorkerId(Long ashaWorkerId);

    List<ImmunizationRecord> findByPatientPhcId(String phcId);

    List<ImmunizationRecord> findByPatientIdAndVaccineId(Long patientId, Long vaccineId);

    Optional<ImmunizationRecord> findByPatientIdAndVaccineIdAndDoseNumber(Long patientId, Long vaccineId, Integer doseNumber);

    boolean existsByPatientIdAndVaccineIdAndDoseNumberAndAdministeredDate(
            Long patientId, Long vaccineId, Integer doseNumber, LocalDate administeredDate);

    // Upcoming records
    List<ImmunizationRecord> findByAdministeredAndNextDueDateBetween(
            Integer administered, LocalDate start, LocalDate end);

    List<ImmunizationRecord> findByAdministeredAndNextDueDateBetweenAndPatientAshaWorkerId(
            Integer administered, LocalDate start, LocalDate end, Long ashaWorkerId);

    List<ImmunizationRecord> findByAdministeredAndNextDueDateBetweenAndPatientPhcId(
            Integer administered, LocalDate start, LocalDate end, String phcId);

    // Overdue records
    List<ImmunizationRecord> findByAdministeredAndNextDueDateBefore(
            Integer administered, LocalDate date);

    List<ImmunizationRecord> findByAdministeredAndNextDueDateBeforeAndPatientAshaWorkerId(
            Integer administered, LocalDate date, Long ashaWorkerId);

    List<ImmunizationRecord> findByAdministeredAndNextDueDateBeforeAndPatientPhcId(
            Integer administered, LocalDate date, String phcId);
}
