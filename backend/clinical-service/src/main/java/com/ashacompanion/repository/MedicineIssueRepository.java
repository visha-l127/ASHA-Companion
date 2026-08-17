package com.ashacompanion.repository;

import com.ashacompanion.entity.MedicineIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicineIssueRepository extends JpaRepository<MedicineIssue, Long> {

    List<MedicineIssue> findByAshaWorkerIdAndActive(Long ashaWorkerId, Integer active);

    List<MedicineIssue> findByPatientIdAndActive(Long patientId, Integer active);

    List<MedicineIssue> findByPhcIdAndActive(String phcId, Integer active);

    List<MedicineIssue> findByActive(Integer active);
}
