package com.ashacompanion.controller;

import com.ashacompanion.dto.AuditLogResponseDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import com.ashacompanion.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public AuditLogController(AuditLogService auditLogService, UserRepository userRepository) {
        this.auditLogService = auditLogService;
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
    public ResponseEntity<List<AuditLogResponseDTO>> getAuditLogs() {
        User currentUser = getCurrentUser();
        List<AuditLogResponseDTO> logs = auditLogService.getAuditLogs(currentUser);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponseDTO> getAuditLogById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        AuditLogResponseDTO log = auditLogService.getAuditLogById(id, currentUser);
        return ResponseEntity.ok(log);
    }

    @DeleteMapping
    public ResponseEntity<Void> purgeAuditLogs() {
        User currentUser = getCurrentUser();
        if (!"ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only administrators can purge audit logs");
        }
        auditLogService.purgeAuditLogs();
        return ResponseEntity.noContent().build();
    }
}
