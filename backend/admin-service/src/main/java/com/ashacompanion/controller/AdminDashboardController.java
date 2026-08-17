package com.ashacompanion.controller;

import com.ashacompanion.dto.AdminDashboardStatsDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.entity.SystemSettings;
import com.ashacompanion.repository.AuditLogRepository;
import com.ashacompanion.repository.PHCRepository;
import com.ashacompanion.repository.SystemSettingsRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin-dashboard-stats")
public class AdminDashboardController {

    private final PHCRepository phcRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemSettingsRepository systemSettingsRepository;

    public AdminDashboardController(PHCRepository phcRepository, UserRepository userRepository,
                                    AuditLogRepository auditLogRepository, SystemSettingsRepository systemSettingsRepository) {
        this.phcRepository = phcRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.systemSettingsRepository = systemSettingsRepository;
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
    public ResponseEntity<AdminDashboardStatsDTO> getAdminDashboardStats() {
        User currentUser = getCurrentUser();
        if (!"ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only administrators can access admin dashboard statistics");
        }

        long totalPhcs = phcRepository.count();
        long activePhcs = phcRepository.findAll().stream().filter(p -> p.isActive()).count();
        long inactivePhcs = totalPhcs - activePhcs;

        long totalUsers = userRepository.count();
        long totalSupervisors = userRepository.findByRole("PHC_SUPERVISOR").size();
        long totalAshas = userRepository.findByRole("ASHA").size();
        long totalPharmacists = userRepository.findByRole("PHARMACIST").size();

        long totalAuditLogs = auditLogRepository.count();

        SystemSettings settings = systemSettingsRepository.findById(1L)
                .orElseGet(() -> new SystemSettings(30, 50, "8:1", true, "Dr. R. Kannan (DHO Coimbatore)", "daily", "https://national-health-portal.gov.in/api/v1"));

        AdminDashboardStatsDTO stats = new AdminDashboardStatsDTO(
            totalPhcs,
            activePhcs,
            inactivePhcs,
            totalUsers,
            totalSupervisors,
            totalAshas,
            totalPharmacists,
            totalAuditLogs,
            settings.getOfflineTtl(),
            settings.getMaxDbSize(),
            settings.getCompressionRatio(),
            settings.getDistrictIncharge(),
            settings.getServerUrl()
        );

        return ResponseEntity.ok(stats);
    }
}
