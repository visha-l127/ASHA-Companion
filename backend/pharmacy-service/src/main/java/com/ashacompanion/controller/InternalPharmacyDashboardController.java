package com.ashacompanion.controller;

import com.ashacompanion.dto.*;
import com.ashacompanion.dto.dashboard.*;
import com.ashacompanion.entity.User;
import com.ashacompanion.service.PharmacyDashboardService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/internal/dashboard")
public class InternalPharmacyDashboardController {
    private final PharmacyDashboardService pharmacyDashboardService;

    public InternalPharmacyDashboardController(PharmacyDashboardService pharmacyDashboardService) {
        this.pharmacyDashboardService = pharmacyDashboardService;
    }

    @PostMapping("/pharmacy/summary")
    public MedicineDashboardDTO getPharmacySummary(@RequestBody User currentUser) {
        return pharmacyDashboardService.getPharmacySummary(currentUser);
    }

    @PostMapping("/pharmacy/forecast-alerts")
    public List<MedicineForecastResponseDTO> getInventoryForecastAlerts(@RequestBody User currentUser) {
        return pharmacyDashboardService.getInventoryForecastAlerts(currentUser);
    }

    @PostMapping("/pharmacy/expiry-alerts")
    public List<MedicineExpiryAIResponseDTO> getRecentExpiryAlerts(@RequestBody User currentUser) {
        return pharmacyDashboardService.getRecentExpiryAlerts(currentUser);
    }

    @PostMapping("/pharmacy/transactions")
    public List<MedicineTransactionResponseDTO> getRecentTransactions(@RequestBody User currentUser) {
        return pharmacyDashboardService.getRecentTransactions(currentUser);
    }

    @PostMapping("/alerts")
    public List<DashboardAlertDTO> getDashboardAlerts(@RequestBody User currentUser) {
        return pharmacyDashboardService.getDashboardAlerts(currentUser);
    }


    @PostMapping("/pharmacy/expired")
    public List<MedicineBatchResponseDTO> getExpiredMedicineBatches(@RequestBody User currentUser) {
        return pharmacyDashboardService.getExpiredMedicineBatches(currentUser);
    }


    @PostMapping("/pharmacy/low-stock")
    public List<MedicineStockSummaryDTO> getLowStockMedicines(@RequestBody User currentUser) {
        return pharmacyDashboardService.getLowStockMedicines(currentUser);
    }

    @PostMapping("/pharmacy/expiring")
    public List<MedicineBatchResponseDTO> getExpiringMedicineBatches(@RequestBody User currentUser) {
        return pharmacyDashboardService.getExpiringMedicineBatches(currentUser);
    }

}