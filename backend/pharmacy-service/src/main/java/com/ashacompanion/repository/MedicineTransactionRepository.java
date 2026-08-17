package com.ashacompanion.repository;

import com.ashacompanion.entity.MedicineTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineTransactionRepository extends JpaRepository<MedicineTransaction, Long> {

    List<MedicineTransaction> findByPhcIdOrderByTransactionTimeDesc(String phcId);

    List<MedicineTransaction> findByBatchIdOrderByTransactionTimeDesc(Long batchId);

    List<MedicineTransaction> findByBatchMedicineIdAndPhcIdOrderByTransactionTimeDesc(Long medicineId, String phcId);

    List<MedicineTransaction> findAllByOrderByTransactionTimeDesc();

    List<MedicineTransaction> findByBatchMedicineIdAndTransactionType(Long medicineId, String transactionType);
}
