package com.ashacompanion.ai.controller;

import com.ashacompanion.ai.dto.*;
import com.ashacompanion.ai.service.AIService;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/ai")
@Tag(name = "AI Decision Support", description = "AI-assisted preliminary screening, decision support, demand forecasting, and risk analytics.")
public class AIController {

    private final AIService aiService;
    private final UserRepository userRepository;

    public AIController(AIService aiService, UserRepository userRepository) {
        this.aiService = aiService;
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

    @GetMapping("/maternal/{pregnancyId}/risk")
    @Operation(summary = "Get Maternal AI Risk Assessment", description = "AI-assisted preliminary risk screening for pregnant beneficiary.")
    public ResponseEntity<MaternalAIResponseDTO> getMaternalAIRisk(@PathVariable Long pregnancyId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getMaternalAIRisk(pregnancyId, currentUser));
    }

    @GetMapping("/immunization/{patientId}/risk")
    @Operation(summary = "Get Immunization AI Defaulter Risk", description = "AI-assisted screening for child vaccination defaulters and upcoming schedule prioritization.")
    public ResponseEntity<ImmunizationAIResponseDTO> getImmunizationAIRisk(@PathVariable Long patientId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getImmunizationAIRisk(patientId, currentUser));
    }

    @GetMapping("/nutrition/{patientId}/risk")
    @Operation(summary = "Get Nutrition AI Growth Risk", description = "AI-assisted growth monitoring trajectory and malnutrition screening.")
    public ResponseEntity<NutritionAIResponseDTO> getNutritionAIRisk(@PathVariable Long patientId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getNutritionAIRisk(patientId, currentUser));
    }

    @GetMapping("/medicine/{medicineCode}/forecast")
    @Operation(summary = "Get Medicine Demand Forecast", description = "AI-assisted 30-day stockout risk and demand forecasting.")
    public ResponseEntity<MedicineForecastResponseDTO> getMedicineDemandForecast(@PathVariable String medicineCode) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getMedicineDemandForecast(medicineCode, currentUser));
    }

    @GetMapping("/medicine/{medicineCode}/expiry-risk")
    @Operation(summary = "Get Medicine Batch Expiry Risk", description = "AI-assisted batch expiry risk analysis and projected unused stock estimation.")
    public ResponseEntity<MedicineExpiryAIResponseDTO> getMedicineExpiryRisk(@PathVariable String medicineCode) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getMedicineExpiryRisk(medicineCode, currentUser));
    }

    @GetMapping("/patient/{patientId}/overview")
    @Operation(summary = "Get Comprehensive Patient AI Clinical Overview", description = "Combines maternal, immunization, and growth monitoring AI risk evaluations for a patient.")
    public ResponseEntity<PatientAIOverviewDTO> getPatientAIOverview(@PathVariable Long patientId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getPatientAIOverview(patientId, currentUser));
    }

    @GetMapping("/dashboard/summary")
    @Operation(summary = "Get AI Dashboard Summary Metrics", description = "Role-scoped high-level AI risk statistics for dashboard cards.")
    public ResponseEntity<AIDashboardSummaryDTO> getAIDashboardSummary() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getAIDashboardSummary(currentUser));
    }

    @GetMapping("/visits/prioritized")
    @Operation(summary = "Get AI Visit Prioritization", description = "AI-based priority scoring for ASHA visits scoped to the current ASHA worker.")
    public ResponseEntity<List<AIPrioritizedVisitDTO>> getAIPrioritizedVisits() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(aiService.getAIPrioritizedVisits(currentUser));
    }
}
