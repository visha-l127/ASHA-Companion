package com.ashacompanion.controller;

import com.ashacompanion.dto.HealthRiskAssessmentResponseDTO;
import com.ashacompanion.dto.HealthRiskSummaryDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import com.ashacompanion.service.HealthRiskIntelligenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/health-risks")
public class HealthRiskController {

    private final HealthRiskIntelligenceService riskService;
    private final UserRepository userRepository;

    public HealthRiskController(HealthRiskIntelligenceService riskService, UserRepository userRepository) {
        this.riskService = riskService;
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

    @PostMapping("/evaluate/{patientId}")
    public ResponseEntity<HealthRiskAssessmentResponseDTO> evaluatePatientRisk(@PathVariable Long patientId) {
        User currentUser = getCurrentUser();
        HealthRiskAssessmentResponseDTO response = riskService.evaluatePatientRisk(patientId, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<HealthRiskAssessmentResponseDTO>> getPatientRiskHistory(@PathVariable Long patientId) {
        User currentUser = getCurrentUser();
        List<HealthRiskAssessmentResponseDTO> response = riskService.getPatientAssessments(patientId, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<HealthRiskAssessmentResponseDTO>> getHighRiskPatients() {
        User currentUser = getCurrentUser();
        List<HealthRiskAssessmentResponseDTO> response = riskService.getHighRiskPatients(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<HealthRiskSummaryDTO> getSummary() {
        User currentUser = getCurrentUser();
        HealthRiskSummaryDTO summary = riskService.getSummary(currentUser);
        return ResponseEntity.ok(summary);
    }
}
