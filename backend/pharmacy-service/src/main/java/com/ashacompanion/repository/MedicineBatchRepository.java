package com.ashacompanion.repository;

import com.ashacompanion.entity.MedicineBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineBatchRepository extends JpaRepository<MedicineBatch, Long> {

    List<MedicineBatch> findByPhcId(String phcId);

    List<MedicineBatch> findByPhcIdAndActiveFlag(String phcId, Integer activeFlag);

    List<MedicineBatch> findByMedicineIdAndPhcId(Long medicineId, String phcId);

    List<MedicineBatch> findByMedicineIdAndPhcIdAndActiveFlag(Long medicineId, String phcId, Integer activeFlag);

    // Expired batches
    List<MedicineBatch> findByPhcIdAndExpiryDateBeforeAndActiveFlag(String phcId, LocalDate date, Integer activeFlag);

    // Expiring-soon batches
    List<MedicineBatch> findByPhcIdAndActiveFlagAndExpiryDateBetween(String phcId, Integer activeFlag, LocalDate start, LocalDate end);

    // Low stock batches
    List<MedicineBatch> findByPhcIdAndQuantityLessThanEqual(String phcId, Integer quantity);

    // Global queries for ADMIN
    List<MedicineBatch> findByExpiryDateBeforeAndActiveFlag(LocalDate date, Integer activeFlag);

    List<MedicineBatch> findByActiveFlagAndExpiryDateBetween(Integer activeFlag, LocalDate start, LocalDate end);

    List<MedicineBatch> findByMedicineIdAndActiveFlag(Long medicineId, Integer activeFlag);
}
