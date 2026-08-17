package com.ashacompanion.service;

import com.ashacompanion.dto.*;
import com.ashacompanion.dto.dashboard.*;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PharmacyDashboardService {

    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository medicineBatchRepository;
    private final MedicineInventoryService medicineInventoryService;

    public PharmacyDashboardService(
        MedicineRepository medicineRepository,
        MedicineBatchRepository medicineBatchRepository,
        MedicineInventoryService medicineInventoryService
    ) {
        this.medicineRepository = medicineRepository;
        this.medicineBatchRepository = medicineBatchRepository;
        this.medicineInventoryService = medicineInventoryService;
    }

    private void verifySupervisorOrAdmin(User user) {
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: User is null");
        }
        String role = user.getRole();
        if (role != null && role.startsWith("ROLE_")) {
            role = role.substring(5);
        }
        if (!"ADMIN".equals(role) && !"PHC_SUPERVISOR".equals(role) && !"PHARMACIST".equals(role)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Insufficient dashboard privileges");
        }
    }

    private boolean isAdmin(User user) {
        if (user == null || user.getRole() == null) return false;
        String role = user.getRole();
        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }
        return "ADMIN".equals(role);
    }


    public MedicineDashboardDTO getPharmacySummary(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = isAdmin(currentUser);
        String phcId = currentUser.getPhcId();
        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        List<Medicine> medicines = medicineRepository.findByActiveFlag(1);
        long activeMedCount = medicines.size();

        List<MedicineBatch> allBatches = isAdmin ? medicineBatchRepository.findAll() : (phcId != null ? medicineBatchRepository.findByPhcId(phcId) : Collections.emptyList());

        long activeBatchCount = allBatches.stream().filter(MedicineBatch::isActive).count();
        long totalStock = 0;
        long expiringCount = 0;
        long expiredCount = 0;
        long lowStockCount = 0;

        for (MedicineBatch b : allBatches) {
            if (!b.isActive()) continue;
            if (b.getExpiryDate() != null) {
                if (b.getExpiryDate().isBefore(today)) {
                    expiredCount++;
                } else {
                    totalStock += b.getQuantity();
                    if (!b.getExpiryDate().isAfter(todayPlus30)) {
                        expiringCount++;
                    }
                }
            } else {
                totalStock += b.getQuantity();
            }
        }

        for (Medicine med : medicines) {
            List<MedicineBatch> batches = isAdmin ?
                    medicineBatchRepository.findAll().stream().filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(med.getId()) && b.isActive()).collect(Collectors.toList()) :
                    (phcId != null ? medicineBatchRepository.findByMedicineIdAndPhcIdAndActiveFlag(med.getId(), phcId, 1) : Collections.emptyList());

            int avail = batches.stream()
                    .filter(b -> b.getExpiryDate() != null && !b.getExpiryDate().isBefore(today))
                    .mapToInt(MedicineBatch::getQuantity).sum();

            if (avail <= med.getReorderLevel()) {
                lowStockCount++;
            }
        }

        return new MedicineDashboardDTO(activeMedCount, totalStock, lowStockCount, expiringCount, expiredCount, activeBatchCount);
    }

    public List<MedicineStockSummaryDTO> getLowStockMedicines(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        String phcId = isAdmin(currentUser) ? null : currentUser.getPhcId();
        return medicineInventoryService.getLowStockSummary(phcId);
    }

    public List<MedicineBatchResponseDTO> getExpiringMedicineBatches(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        String phcId = isAdmin(currentUser) ? null : currentUser.getPhcId();
        return medicineInventoryService.getExpiringBatches(phcId);
    }

    public List<MedicineBatchResponseDTO> getExpiredMedicineBatches(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = isAdmin(currentUser);
        String phcId = currentUser.getPhcId();
        LocalDate today = LocalDate.now();

        List<MedicineBatch> batches = isAdmin ?
                medicineBatchRepository.findByExpiryDateBeforeAndActiveFlag(today, 1) :
                (phcId != null ? medicineBatchRepository.findByPhcIdAndExpiryDateBeforeAndActiveFlag(phcId, today, 1) : Collections.emptyList());

        return batches.stream().map(MedicineBatchResponseDTO::new).collect(Collectors.toList());
    }
    public List<DashboardAlertDTO> getDashboardAlerts(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = isAdmin(currentUser);
        String phcId = currentUser.getPhcId();
        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        List<DashboardAlertDTO> alerts = new ArrayList<>();

        // Medicine Low Stock & Expiry
        List<Medicine> medicines = medicineRepository.findByActiveFlag(1);
        for (Medicine med : medicines) {
            List<MedicineBatch> batches = isAdmin ?
                    medicineBatchRepository.findAll().stream().filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(med.getId()) && b.isActive()).collect(Collectors.toList()) :
                    (phcId != null ? medicineBatchRepository.findByMedicineIdAndPhcIdAndActiveFlag(med.getId(), phcId, 1) : Collections.emptyList());

            int avail = batches.stream().filter(b -> b.getExpiryDate() != null && !b.getExpiryDate().isBefore(today)).mapToInt(MedicineBatch::getQuantity).sum();
            if (avail <= med.getReorderLevel()) {
                alerts.add(new DashboardAlertDTO(
                        "LOW_STOCK_MEDICINE",
                        "HIGH",
                        med.getId(),
                        "Medicine stock level (" + avail + ") is at or below reorder level (" + med.getReorderLevel() + ")",
                        null,
                        null,
                        phcId
                ));
            }
        }

        List<MedicineBatch> expiringBatches = isAdmin ?
                medicineBatchRepository.findByActiveFlagAndExpiryDateBetween(1, today, todayPlus30) :
                (phcId != null ? medicineBatchRepository.findByPhcIdAndActiveFlagAndExpiryDateBetween(phcId, 1, today, todayPlus30) : Collections.emptyList());
        for (MedicineBatch b : expiringBatches) {
            alerts.add(new DashboardAlertDTO(
                    "EXPIRING_MEDICINE",
                    "MEDIUM",
                    b.getId(),
                    "Medicine batch " + b.getBatchNumber() + " expires on " + b.getExpiryDate(),
                    null,
                    null,
                    b.getPhcId()
            ));
        }

        List<MedicineBatch> expiredBatches = isAdmin ?
                medicineBatchRepository.findByExpiryDateBeforeAndActiveFlag(today, 1) :
                (phcId != null ? medicineBatchRepository.findByPhcIdAndExpiryDateBeforeAndActiveFlag(phcId, today, 1) : Collections.emptyList());
        for (MedicineBatch b : expiredBatches) {
            alerts.add(new DashboardAlertDTO(
                    "EXPIRED_MEDICINE",
                    "HIGH",
                    b.getId(),
                    "Medicine batch " + b.getBatchNumber() + " expired on " + b.getExpiryDate(),
                    null,
                    null,
                    b.getPhcId()
            ));
        }

        return alerts;
    }


    public List<MedicineForecastResponseDTO> getInventoryForecastAlerts(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        // Stubbed for pharmacy service (AI service handles actual forecasting)
        return new ArrayList<>();
    }

    public List<MedicineExpiryAIResponseDTO> getRecentExpiryAlerts(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        String phcId = isAdmin(currentUser) ? null : currentUser.getPhcId();
        List<MedicineBatchResponseDTO> expiring = medicineInventoryService.getExpiringBatches(phcId);
        
        List<MedicineExpiryAIResponseDTO> alerts = new ArrayList<>();
        if (expiring != null) {
            for (MedicineBatchResponseDTO b : expiring) {
                MedicineExpiryAIResponseDTO dto = new MedicineExpiryAIResponseDTO();
                dto.setMedicineCode(b.getMedicineCode());
                dto.setMedicineName(b.getMedicineName());
                dto.setBatchNumber(b.getBatchNumber());
                dto.setBatchId(b.getId());
                dto.setCurrentQuantity(b.getQuantity());
                dto.setExpiryDate(b.getExpiryDate());
                dto.setExpiryRisk("MEDIUM");
                alerts.add(dto);
            }
        }
        return alerts;
    }

    public List<MedicineTransactionResponseDTO> getRecentTransactions(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        String phcId = isAdmin(currentUser) ? null : currentUser.getPhcId();
        return medicineInventoryService.getTransactions(phcId);
    }

}
