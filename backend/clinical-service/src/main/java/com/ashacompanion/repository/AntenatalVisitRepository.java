package com.ashacompanion.repository;

import com.ashacompanion.entity.AntenatalVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AntenatalVisitRepository extends JpaRepository<AntenatalVisit, Long> {

    List<AntenatalVisit> findByPregnancyId(Long pregnancyId);

    List<AntenatalVisit> findByRecordedByUserId(Long recordedByUserId);

    List<AntenatalVisit> findByPregnancyPatientPhcId(String phcId);
}
