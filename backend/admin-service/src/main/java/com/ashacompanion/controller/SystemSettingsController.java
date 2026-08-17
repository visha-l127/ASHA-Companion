package com.ashacompanion.controller;

import com.ashacompanion.entity.SystemSettings;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.SystemSettingsRepository;
import com.ashacompanion.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
public class SystemSettingsController {

    private final SystemSettingsRepository systemSettingsRepository;
    private final UserRepository userRepository;

    public SystemSettingsController(SystemSettingsRepository systemSettingsRepository, UserRepository userRepository) {
        this.systemSettingsRepository = systemSettingsRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void seedDefaultSettings() {
        if (systemSettingsRepository.count() == 0) {
            systemSettingsRepository.save(new SystemSettings(
                30,
                50,
                "8:1",
                true,
                "Dr. R. Kannan (DHO Coimbatore)",
                "daily",
                "https://national-health-portal.gov.in/api/v1"
            ));
            System.out.println("Default system settings successfully seeded in system_settings table.");
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    private void verifyAdmin() {
        User currentUser = getCurrentUser();
        if (!"ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only administrators can modify system configurations");
        }
    }

    @GetMapping
    public ResponseEntity<SystemSettings> getSettings() {
        // Any logged-in user can check settings for client sync parameters
        getCurrentUser();
        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseGet(() -> new SystemSettings(
                    30, 50, "8:1", true, "Dr. R. Kannan (DHO Coimbatore)", "daily", "https://national-health-portal.gov.in/api/v1"
                ));
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings settings) {
        verifyAdmin();
        settings.setId(1L); // Force ID = 1 to overwrite configuration
        SystemSettings saved = systemSettingsRepository.save(settings);
        return ResponseEntity.ok(saved);
    }
}
