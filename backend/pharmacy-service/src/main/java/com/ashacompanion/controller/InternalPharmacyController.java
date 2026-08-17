package com.ashacompanion.controller;

import com.ashacompanion.dto.MedicineBatchRequestDTO;
import com.ashacompanion.dto.MedicineBatchResponseDTO;
import com.ashacompanion.entity.*;
import com.ashacompanion.repository.*;
import com.ashacompanion.service.MedicineInventoryService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/internal")
public class InternalPharmacyController {
    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository medicineBatchRepository;
    private final MedicineTransactionRepository medicineTransactionRepository;
    private final MedicineInventoryService medicineInventoryService;

    public InternalPharmacyController(
        MedicineRepository medicineRepository,
        MedicineBatchRepository medicineBatchRepository,
        MedicineTransactionRepository medicineTransactionRepository,
        MedicineInventoryService medicineInventoryService
    ) {
        this.medicineRepository = medicineRepository;
        this.medicineBatchRepository = medicineBatchRepository;
        this.medicineTransactionRepository = medicineTransactionRepository;
        this.medicineInventoryService = medicineInventoryService;
    }

    @PostMapping("/sync/receive-stock")
    public MedicineBatchResponseDTO receiveStock(@RequestBody MedicineBatchRequestDTO request) {
        return medicineInventoryService.receiveStock(request);
    }

    @GetMapping("/medicines/code/{code}")
    public Medicine getMedicineByCode(@PathVariable String code) {
        return medicineRepository.findByCode(code).orElse(null);
    }

    @GetMapping("/medicines/id/{id}")
    public Medicine getMedicineById(@PathVariable Long id) {
        return medicineRepository.findById(id).orElse(null);
    }

    @GetMapping("/medicine-batches/medicine/{medicineId}/active")
    public List<MedicineBatch> getActiveBatches(@PathVariable Long medicineId) {
        return medicineBatchRepository.findByMedicineIdAndActiveFlag(medicineId, 1);
    }

    @GetMapping("/medicine-transactions/medicine/{medicineId}/phc/{phcId}")
    public List<MedicineTransaction> getTransactions(@PathVariable Long medicineId, @PathVariable String phcId) {
        return medicineTransactionRepository.findByBatchMedicineIdAndPhcIdOrderByTransactionTimeDesc(medicineId, phcId);
    }

    @GetMapping("/batches")
    public List<MedicineBatch> getAllBatches() {
        return medicineBatchRepository.findAll();
    }

    @GetMapping("/medicines")
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    @GetMapping("/transactions")
    public List<MedicineTransaction> getAllTransactions() {
        return medicineTransactionRepository.findAll();
    }

    @GetMapping("/batches/stockout-count")
    public long getStockoutCount() {
        return medicineBatchRepository.findAll().stream().filter(mb -> mb.getQuantity() != null && mb.getQuantity() < 20).count();
    }

    @GetMapping("/batches/expiry-count")
    public long getExpiryCount() {
        return medicineBatchRepository.findAll().stream().filter(mb -> mb.getExpiryDate() != null && mb.getExpiryDate().isBefore(LocalDate.now().plusDays(60))).count();
    }

    @GetMapping("/batches/phc/{phcId}")
    public List<MedicineBatch> getBatchesByPhc(@PathVariable String phcId) {
        return medicineBatchRepository.findByPhcId(phcId);
    }

    @GetMapping("/medicine-batches/medicine/{medicineId}/phc/{phcId}/active")
    public List<MedicineBatch> getActiveBatchesByPhc(@PathVariable Long medicineId, @PathVariable String phcId) {
        return medicineBatchRepository.findByMedicineIdAndPhcIdAndActiveFlag(medicineId, phcId, 1);
    }
}
