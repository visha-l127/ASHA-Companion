package com.ashacompanion.repository;

import com.ashacompanion.entity.EhrRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EhrRecordRepository extends JpaRepository<EhrRecord, Long> {
    Optional<EhrRecord> findByRecordId(String recordId);
    List<EhrRecord> findByPhcId(String phcId);
    List<EhrRecord> findByWorkerId(String workerId);
}
