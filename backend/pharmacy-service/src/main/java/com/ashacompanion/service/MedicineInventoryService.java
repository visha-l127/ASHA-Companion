package com.ashacompanion.service;

import com.ashacompanion.dto.*;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.*;
import com.ashacompanion.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineInventoryService {

    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository medicineBatchRepository;
    private final MedicineTransactionRepository medicineTransactionRepository;
    private final UserRepository userRepository;

    public MedicineInventoryService(MedicineRepository medicineRepository,
                                    MedicineBatchRepository medicineBatchRepository,
                                    MedicineTransactionRepository medicineTransactionRepository,
                                    UserRepository userRepository) {
        this.medicineRepository = medicineRepository;
        this.medicineBatchRepository = medicineBatchRepository;
        this.medicineTransactionRepository = medicineTransactionRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    private void validatePhcScope(String targetPhcId) {
        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        if (!isAdmin) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(targetPhcId)) {
                throw new AccessDeniedException("Access denied: You do not have access to this PHC inventory");
            }
        }
    }

    @Transactional
    public MedicineBatchResponseDTO receiveStock(MedicineBatchRequestDTO request) {
        User currentUser = getCurrentUser();
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + request.getMedicineId()));

        if (request.getManufacturingDate() != null && request.getExpiryDate().isBefore(request.getManufacturingDate())) {
            throw new IllegalArgumentException("Expiry date cannot be before manufacturing date");
        }
        if (request.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        String finalPhcId;
        if ("ADMIN".equals(currentUser.getRole())) {
            if (request.getPhcId() == null || request.getPhcId().trim().isEmpty()) {
                throw new IllegalArgumentException("PHC ID is required for Admin to receive stock");
            }
            finalPhcId = request.getPhcId();
        } else {
            if (currentUser.getPhcId() == null || currentUser.getPhcId().trim().isEmpty()) {
                throw new IllegalArgumentException("Pharmacist has no assigned PHC");
            }
            finalPhcId = currentUser.getPhcId();
        }

        MedicineBatch batch = new MedicineBatch();
        batch.setMedicine(medicine);
        batch.setBatchNumber(request.getBatchNumber());
        batch.setManufacturingDate(request.getManufacturingDate());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setQuantity(request.getQuantity());
        batch.setOriginalQuantity(request.getQuantity());
        batch.setUnit(request.getUnit());
        batch.setPhcId(finalPhcId);
        batch.setReceivedByUserId(currentUser.getId());
        batch.setActiveFlag(1);

        MedicineBatch savedBatch = medicineBatchRepository.save(batch);

        MedicineTransaction tx = new MedicineTransaction();
        tx.setBatch(savedBatch);
        tx.setTransactionType("RECEIVED");
        tx.setQuantity(request.getQuantity());
        tx.setQuantityBefore(0);
        tx.setQuantityAfter(request.getQuantity());
        tx.setReason("Stock received");
        tx.setPhcId(finalPhcId);
        tx.setPerformedByUserId(currentUser.getId());

        medicineTransactionRepository.save(tx);

        return new MedicineBatchResponseDTO(savedBatch);
    }

    @Transactional
    public MedicineTransactionResponseDTO dispenseStock(MedicineDispenseRequestDTO request) {
        User currentUser = getCurrentUser();
        MedicineBatch batch = medicineBatchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine batch not found with ID: " + request.getBatchId()));

        validatePhcScope(batch.getPhcId());

        if (!batch.isActive()) {
            throw new IllegalArgumentException("Batch is inactive");
        }
        if (batch.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Batch is expired");
        }
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Dispense quantity must be greater than zero");
        }
        if (batch.getQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock");
        }

        int before = batch.getQuantity();
        int after = before - request.getQuantity();
        batch.setQuantity(after);
        medicineBatchRepository.save(batch);

        MedicineTransaction tx = new MedicineTransaction();
        tx.setBatch(batch);
        tx.setTransactionType("DISPENSED");
        tx.setQuantity(request.getQuantity());
        tx.setQuantityBefore(before);
        tx.setQuantityAfter(after);
        tx.setReason(request.getReason());
        tx.setReference(request.getReference());
        tx.setPhcId(batch.getPhcId());
        tx.setPerformedByUserId(currentUser.getId());

        MedicineTransaction savedTx = medicineTransactionRepository.save(tx);

        return new MedicineTransactionResponseDTO(savedTx);
    }

    @Transactional
    public MedicineTransactionResponseDTO adjustStock(MedicineStockAdjustmentRequestDTO request) {
        User currentUser = getCurrentUser();
        MedicineBatch batch = medicineBatchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine batch not found with ID: " + request.getBatchId()));

        validatePhcScope(batch.getPhcId());

        if (!batch.isActive()) {
            throw new IllegalArgumentException("Batch is inactive");
        }
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Adjustment quantity must be greater than zero");
        }

        int before = batch.getQuantity();
        int after;

        if ("ADJUSTMENT_IN".equalsIgnoreCase(request.getTransactionType())) {
            after = before + request.getQuantity();
        } else if ("ADJUSTMENT_OUT".equalsIgnoreCase(request.getTransactionType())) {
            if (before < request.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for adjustment out");
            }
            after = before - request.getQuantity();
        } else {
            throw new IllegalArgumentException("Invalid transaction type: " + request.getTransactionType());
        }

        batch.setQuantity(after);
        medicineBatchRepository.save(batch);

        MedicineTransaction tx = new MedicineTransaction();
        tx.setBatch(batch);
        tx.setTransactionType(request.getTransactionType().toUpperCase());
        tx.setQuantity(request.getQuantity());
        tx.setQuantityBefore(before);
        tx.setQuantityAfter(after);
        tx.setReason(request.getReason());
        tx.setReference(request.getReference());
        tx.setPhcId(batch.getPhcId());
        tx.setPerformedByUserId(currentUser.getId());

        MedicineTransaction savedTx = medicineTransactionRepository.save(tx);

        return new MedicineTransactionResponseDTO(savedTx);
    }

    public List<MedicineBatchResponseDTO> getExpiredBatches(String phcId) {
        User currentUser = getCurrentUser();
        LocalDate today = LocalDate.now();
        List<MedicineBatch> batches;

        if ("ADMIN".equals(currentUser.getRole())) {
            if (phcId != null && !phcId.trim().isEmpty()) {
                batches = medicineBatchRepository.findByPhcIdAndExpiryDateBeforeAndActiveFlag(phcId, today, 1);
            } else {
                batches = medicineBatchRepository.findByExpiryDateBeforeAndActiveFlag(today, 1);
            }
        } else {
            String finalPhcId = currentUser.getPhcId();
            if (finalPhcId == null) {
                return new ArrayList<>();
            }
            batches = medicineBatchRepository.findByPhcIdAndExpiryDateBeforeAndActiveFlag(finalPhcId, today, 1);
        }

        return batches.stream().map(MedicineBatchResponseDTO::new).collect(Collectors.toList());
    }

    public List<MedicineBatchResponseDTO> getExpiringBatches(String phcId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            currentUser = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(30);
        List<MedicineBatch> batches;

        boolean isAdmin = false;
        String finalPhcId = phcId;

        if (currentUser != null) {
            String role = currentUser.getRole();
            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }
            isAdmin = "ADMIN".equals(role);
            if (!isAdmin) {
                finalPhcId = currentUser.getPhcId();
            }
        } else {
            isAdmin = (phcId == null || phcId.trim().isEmpty());
        }

        if (isAdmin) {
            if (finalPhcId != null && !finalPhcId.trim().isEmpty()) {
                batches = medicineBatchRepository.findByPhcIdAndActiveFlagAndExpiryDateBetween(finalPhcId, 1, today, end);
            } else {
                batches = medicineBatchRepository.findByActiveFlagAndExpiryDateBetween(1, today, end);
            }
        } else {
            if (finalPhcId == null) {
                return new ArrayList<>();
            }
            batches = medicineBatchRepository.findByPhcIdAndActiveFlagAndExpiryDateBetween(finalPhcId, 1, today, end);
        }

        return batches.stream().map(MedicineBatchResponseDTO::new).collect(Collectors.toList());
    }

    public List<MedicineBatchResponseDTO> getAllBatches(String phcId) {
        User currentUser = getCurrentUser();
        List<MedicineBatch> batches;

        if ("ADMIN".equals(currentUser.getRole())) {
            if (phcId != null && !phcId.trim().isEmpty()) {
                batches = medicineBatchRepository.findByPhcId(phcId);
            } else {
                batches = medicineBatchRepository.findAll();
            }
        } else {
            String finalPhcId = currentUser.getPhcId();
            if (finalPhcId == null) {
                return new ArrayList<>();
            }
            batches = medicineBatchRepository.findByPhcId(finalPhcId);
        }

        return batches.stream().map(MedicineBatchResponseDTO::new).collect(Collectors.toList());
    }

    public List<MedicineStockSummaryDTO> getStockSummary(String phcId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            currentUser = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        List<Medicine> medicines = medicineRepository.findByActiveFlag(1);
        LocalDate today = LocalDate.now();
        LocalDate nextMonth = today.plusDays(30);

        String targetPhcId = phcId;
        boolean globalQuery = (phcId == null || phcId.trim().isEmpty());

        if (currentUser != null) {
            String role = currentUser.getRole();
            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }
            if (!"ADMIN".equals(role)) {
                targetPhcId = currentUser.getPhcId();
                globalQuery = false;
            }
        }

        List<MedicineStockSummaryDTO> summaries = new ArrayList<>();

        for (Medicine medicine : medicines) {
            List<MedicineBatch> batches;
            if (globalQuery) {
                // Fetch all active batches for this medicine globally
                batches = medicineBatchRepository.findAll().stream()
                        .filter(b -> b.getMedicine().getId().equals(medicine.getId()) && b.isActive())
                        .collect(Collectors.toList());
            } else {
                batches = medicineBatchRepository.findByMedicineIdAndPhcIdAndActiveFlag(medicine.getId(), targetPhcId, 1);
            }

            int totalQuantity = 0;
            int expiredQuantity = 0;
            int expiringSoonQuantity = 0;

            for (MedicineBatch b : batches) {
                LocalDate exp = b.getExpiryDate();
                if (exp != null) {
                    if (exp.isBefore(today)) {
                        expiredQuantity += b.getQuantity();
                    } else {
                        totalQuantity += b.getQuantity();
                        if (!exp.isAfter(nextMonth)) {
                            expiringSoonQuantity += b.getQuantity();
                        }
                    }
                }
            }

            boolean lowStock = totalQuantity <= medicine.getReorderLevel();

            summaries.add(new MedicineStockSummaryDTO(
                    medicine.getId(),
                    medicine.getName(),
                    medicine.getCode(),
                    totalQuantity,
                    medicine.getReorderLevel(),
                    lowStock,
                    expiredQuantity,
                    expiringSoonQuantity
            ));
        }

        return summaries;
    }

    public List<MedicineStockSummaryDTO> getLowStockSummary(String phcId) {
        return getStockSummary(phcId).stream()
                .filter(MedicineStockSummaryDTO::isLowStock)
                .collect(Collectors.toList());
    }

    public List<MedicineTransactionResponseDTO> getTransactions(String phcId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            currentUser = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        List<MedicineTransaction> transactions;
        boolean isAdmin = false;
        String finalPhcId = phcId;

        if (currentUser != null) {
            String role = currentUser.getRole();
            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }
            isAdmin = "ADMIN".equals(role);
            if (!isAdmin) {
                finalPhcId = currentUser.getPhcId();
            }
        } else {
            isAdmin = (phcId == null || phcId.trim().isEmpty());
        }

        if (isAdmin) {
            if (finalPhcId != null && !finalPhcId.trim().isEmpty()) {
                transactions = medicineTransactionRepository.findByPhcIdOrderByTransactionTimeDesc(finalPhcId);
            } else {
                transactions = medicineTransactionRepository.findAllByOrderByTransactionTimeDesc();
            }
        } else {
            if (finalPhcId == null) {
                return new ArrayList<>();
            }
            transactions = medicineTransactionRepository.findByPhcIdOrderByTransactionTimeDesc(finalPhcId);
        }

        return transactions.stream().map(MedicineTransactionResponseDTO::new).collect(Collectors.toList());
    }

    public List<MedicineTransactionResponseDTO> getTransactionsByBatch(Long batchId) {
        MedicineBatch batch = medicineBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine batch not found with ID: " + batchId));

        validatePhcScope(batch.getPhcId());

        return medicineTransactionRepository.findByBatchIdOrderByTransactionTimeDesc(batchId).stream()
                .map(MedicineTransactionResponseDTO::new)
                .collect(Collectors.toList());
    }
}
