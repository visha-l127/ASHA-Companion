package com.ashacompanion.controller;

import com.ashacompanion.dto.HealthRiskAlertResponseDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import com.ashacompanion.service.HealthAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/health-alerts")
public class HealthAlertController {

    private final HealthAlertService alertService;
    private final UserRepository userRepository;

    public HealthAlertController(HealthAlertService alertService, UserRepository userRepository) {
        this.alertService = alertService;
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

    @PostMapping("/generate")
    public ResponseEntity<List<HealthRiskAlertResponseDTO>> generateAlerts() {
        User currentUser = getCurrentUser();
        List<HealthRiskAlertResponseDTO> response = alertService.generateAlerts(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<HealthRiskAlertResponseDTO>> getAllAlerts() {
        User currentUser = getCurrentUser();
        List<HealthRiskAlertResponseDTO> response = alertService.getAlerts(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unacknowledged")
    public ResponseEntity<List<HealthRiskAlertResponseDTO>> getUnacknowledgedAlerts() {
        User currentUser = getCurrentUser();
        List<HealthRiskAlertResponseDTO> response = alertService.getUnacknowledgedAlerts(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthRiskAlertResponseDTO> getAlertById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        HealthRiskAlertResponseDTO response = alertService.getAlertById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<HealthRiskAlertResponseDTO> acknowledgeAlert(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        HealthRiskAlertResponseDTO response = alertService.acknowledgeAlert(id, currentUser);
        return ResponseEntity.ok(response);
    }
}
