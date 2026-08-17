package com.ashacompanion.controller;

import com.ashacompanion.dto.*;
import com.ashacompanion.dto.dashboard.*;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import com.ashacompanion.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    // =========================================================================
    // PHASE 10 DASHBOARD ENDPOINTS
    // =========================================================================

    @GetMapping({"/summary", "/metrics"})
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getDashboardSummary(currentUser));
    }

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewDTO> getOverview() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getOverview(currentUser));
    }

    @GetMapping("/patients")
    public ResponseEntity<PatientDashboardDTO> getPatientSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getPatientSummary(currentUser));
    }

    @GetMapping("/asha-workers")
    public ResponseEntity<AshaWorkerDashboardDTO> getAshaWorkerSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getAshaWorkerSummary(currentUser));
    }

    @GetMapping("/maternal")
    public ResponseEntity<MaternalDashboardDTO> getMaternalSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getMaternalSummary(currentUser));
    }

    @GetMapping("/maternal/high-risk")
    public ResponseEntity<List<HighRiskPregnancyDTO>> getHighRiskPregnancies() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getHighRiskPregnancies(currentUser));
    }

    @GetMapping("/immunization")
    public ResponseEntity<ImmunizationDashboardDTO> getImmunizationSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getImmunizationSummary(currentUser));
    }

    @GetMapping("/immunization/overdue")
    public ResponseEntity<List<ImmunizationResponseDTO>> getOverdueImmunizations() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getOverdueImmunizations(currentUser));
    }

    @GetMapping("/immunization/upcoming")
    public ResponseEntity<List<ImmunizationResponseDTO>> getUpcomingImmunizations() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getUpcomingImmunizations(currentUser));
    }

    @GetMapping("/nutrition")
    public ResponseEntity<NutritionDashboardDTO> getNutritionSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getNutritionSummary(currentUser));
    }

    @GetMapping("/nutrition/high-risk")
    public ResponseEntity<List<HighRiskNutritionDTO>> getHighRiskNutrition() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getHighRiskNutrition(currentUser));
    }

    @GetMapping("/medicines")
    public ResponseEntity<MedicineDashboardDTO> getMedicineSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getMedicineSummary(currentUser));
    }

    @GetMapping("/medicines/low-stock")
    public ResponseEntity<List<MedicineStockSummaryDTO>> getLowStockMedicines() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getLowStockMedicines(currentUser));
    }

    @GetMapping("/medicines/expiring")
    public ResponseEntity<List<MedicineBatchResponseDTO>> getExpiringMedicineBatches() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getExpiringMedicineBatches(currentUser));
    }

    @GetMapping("/medicines/expired")
    public ResponseEntity<List<MedicineBatchResponseDTO>> getExpiredMedicineBatches() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getExpiredMedicineBatches(currentUser));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<DashboardAlertDTO>> getDashboardAlerts() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getDashboardAlerts(currentUser));
    }

    // =========================================================================
    // PRESERVED PHASE 9 ENDPOINTS
    // =========================================================================

    @GetMapping("/asha")
    public ResponseEntity<DashboardSummaryDTO> getAshaDashboard() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getAshaDashboard(currentUser));
    }

    @GetMapping("/supervisor")
    public ResponseEntity<DashboardSummaryDTO> getSupervisorDashboard() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getSupervisorDashboard(currentUser));
    }

    @GetMapping("/admin")
    public ResponseEntity<DashboardSummaryDTO> getAdminDashboard() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getAdminDashboard(currentUser));
    }

    @GetMapping("/patients/{patientId}/summary")
    public ResponseEntity<PatientHealthSummaryDTO> getPatientHealthSummary(@PathVariable Long patientId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(dashboardService.getPatientHealthSummary(patientId, currentUser));
    }
}
