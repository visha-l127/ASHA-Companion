package com.ashacompanion.service;

import com.ashacompanion.dto.AuditLogResponseDTO;
import com.ashacompanion.entity.AuditLog;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.AuditLogRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void recordAction(String action, String entityType, String entityId, User currentUser,
                             String description, String requestMethod, String endpoint, String status) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            if (currentUser != null) {
                log.setPerformedBy(currentUser.getId());
                log.setPerformedUsername(currentUser.getUsername());
                log.setRole(currentUser.getRole());
                log.setPhcId(currentUser.getPhcId());
            }
            log.setDescription(description);
            log.setRequestMethod(requestMethod);
            log.setEndpoint(endpoint);
            log.setStatus(status != null ? status : "SUCCESS");
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Swallow audit log failure to ensure core domain logic is not interrupted
            System.err.println("Audit log failure (ignored): " + e.getMessage());
        }
    }

    public List<AuditLogResponseDTO> getAuditLogs(User currentUser) {
        String role = currentUser.getRole();
        List<AuditLog> logs;

        if ("ADMIN".equals(role)) {
            logs = auditLogRepository.findAllByOrderByTimestampDesc();
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            logs = (phcId != null) ? auditLogRepository.findByPhcIdOrderByTimestampDesc(phcId) : Collections.emptyList();
        } else if ("PHARMACIST".equals(role)) {
            String phcId = currentUser.getPhcId();
            List<AuditLog> phcLogs = (phcId != null) ? auditLogRepository.findByPhcIdOrderByTimestampDesc(phcId) : Collections.emptyList();
            logs = phcLogs.stream()
                    .filter(l -> l.getEntityType() != null && (l.getEntityType().contains("MEDICINE") || l.getEntityType().contains("STOCK")))
                    .collect(Collectors.toList());
        } else {
            // ASHA
            logs = auditLogRepository.findByPerformedByOrderByTimestampDesc(currentUser.getId());
        }

        return logs.stream().map(AuditLogResponseDTO::new).collect(Collectors.toList());
    }

    public AuditLogResponseDTO getAuditLogById(Long id, User currentUser) {
        AuditLog log = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found with ID: " + id));

        String role = currentUser.getRole();
        if ("ADMIN".equals(role)) {
            // Global access
        } else if ("PHC_SUPERVISOR".equals(role) || "PHARMACIST".equals(role)) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(log.getPhcId())) {
                throw new AccessDeniedException("Access denied: Audit log belongs to another PHC");
            }
        } else {
            if (currentUser.getId() == null || !currentUser.getId().equals(log.getPerformedBy())) {
                throw new AccessDeniedException("Access denied: Audit log belongs to another user");
            }
        }

        return new AuditLogResponseDTO(log);
    }

    public void purgeAuditLogs() {
        auditLogRepository.deleteAll();
    }
}
