package com.ashacompanion.repository;

import com.ashacompanion.entity.SyncOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyncOperationRepository extends JpaRepository<SyncOperation, Long> {

    Optional<SyncOperation> findByOperationId(String operationId);

    List<SyncOperation> findByUserIdOrderByClientTimestampDesc(Long userId);

    List<SyncOperation> findByPhcIdOrderByClientTimestampDesc(String phcId);

    List<SyncOperation> findByStatus(String status);
}
