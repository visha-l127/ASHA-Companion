package com.ashacompanion.controller;

import com.ashacompanion.dto.*;
import com.ashacompanion.service.MedicineInventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MedicineInventoryController {

    private final MedicineInventoryService inventoryService;

    public MedicineInventoryController(MedicineInventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/medicine-batches")
    public ResponseEntity<MedicineBatchResponseDTO> receiveStock(@Valid @RequestBody MedicineBatchRequestDTO request) {
        MedicineBatchResponseDTO response = inventoryService.receiveStock(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/medicine-batches")
    public ResponseEntity<List<MedicineBatchResponseDTO>> getAllBatches(@RequestParam(required = false) String phcId) {
        List<MedicineBatchResponseDTO> response = inventoryService.getAllBatches(phcId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/medicine-transactions/dispense")
    public ResponseEntity<MedicineTransactionResponseDTO> dispenseStock(@Valid @RequestBody MedicineDispenseRequestDTO request) {
        MedicineTransactionResponseDTO response = inventoryService.dispenseStock(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/medicine-transactions/adjust")
    public ResponseEntity<MedicineTransactionResponseDTO> adjustStock(@Valid @RequestBody MedicineStockAdjustmentRequestDTO request) {
        MedicineTransactionResponseDTO response = inventoryService.adjustStock(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medicine-batches/expired")
    public ResponseEntity<List<MedicineBatchResponseDTO>> getExpiredBatches(@RequestParam(required = false) String phcId) {
        List<MedicineBatchResponseDTO> response = inventoryService.getExpiredBatches(phcId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medicine-batches/expiring")
    public ResponseEntity<List<MedicineBatchResponseDTO>> getExpiringBatches(@RequestParam(required = false) String phcId) {
        List<MedicineBatchResponseDTO> response = inventoryService.getExpiringBatches(phcId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medicine-stock/low")
    public ResponseEntity<List<MedicineStockSummaryDTO>> getLowStockSummary(@RequestParam(required = false) String phcId) {
        List<MedicineStockSummaryDTO> response = inventoryService.getLowStockSummary(phcId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medicine-stock")
    public ResponseEntity<List<MedicineStockSummaryDTO>> getStockSummary(@RequestParam(required = false) String phcId) {
        List<MedicineStockSummaryDTO> response = inventoryService.getStockSummary(phcId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medicine-transactions")
    public ResponseEntity<List<MedicineTransactionResponseDTO>> getTransactions(@RequestParam(required = false) String phcId) {
        List<MedicineTransactionResponseDTO> response = inventoryService.getTransactions(phcId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medicine-transactions/batch/{batchId}")
    public ResponseEntity<List<MedicineTransactionResponseDTO>> getTransactionsByBatch(@PathVariable Long batchId) {
        List<MedicineTransactionResponseDTO> response = inventoryService.getTransactionsByBatch(batchId);
        return ResponseEntity.ok(response);
    }
}
