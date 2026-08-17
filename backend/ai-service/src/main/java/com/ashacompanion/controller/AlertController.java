package com.ashacompanion.controller;

import com.ashacompanion.dto.AlertCountDTO;
import com.ashacompanion.dto.HealthAlertDTO;
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
@RequestMapping("/alerts")
public class AlertController {

    private final HealthAlertService healthAlertService;
    private final UserRepository userRepository;

    public AlertController(HealthAlertService healthAlertService, UserRepository userRepository) {
        this.healthAlertService = healthAlertService;
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

    @GetMapping
    public ResponseEntity<List<HealthAlertDTO>> getAlerts(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String alertType) {
        User currentUser = getCurrentUser();
        List<HealthAlertDTO> alerts = healthAlertService.getAlertsForUser(currentUser, severity, alertType);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/count")
    public ResponseEntity<AlertCountDTO> getAlertCount() {
        User currentUser = getCurrentUser();
        List<HealthAlertDTO> alerts = healthAlertService.getAlertsForUser(currentUser, null, null);

        long total = alerts.size();
        long high = alerts.stream().filter(a -> "HIGH".equalsIgnoreCase(a.getSeverity())).count();
        long medium = alerts.stream().filter(a -> "MEDIUM".equalsIgnoreCase(a.getSeverity())).count();
        long low = alerts.stream().filter(a -> "LOW".equalsIgnoreCase(a.getSeverity())).count();

        AlertCountDTO countDTO = new AlertCountDTO(total, high, medium, low);
        return ResponseEntity.ok(countDTO);
    }
}
