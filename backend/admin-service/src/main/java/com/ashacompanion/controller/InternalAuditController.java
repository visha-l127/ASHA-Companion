package com.ashacompanion.controller;

import com.ashacompanion.entity.AuditLog;
import com.ashacompanion.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/internal/audit-logs")
public class InternalAuditController {
    private final AuditLogRepository auditLogRepository;

    public InternalAuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping
    public void createAuditLog(@RequestBody AuditLogRequest request) {
        AuditLog log = new AuditLog();
        log.setAction(request.action);
        log.setEntityType(request.entityType);
        log.setEntityId(request.entityId);
        log.setPerformedBy(request.performedBy);
        log.setPerformedUsername(request.performedByName);
        log.setDescription(request.details);
        log.setStatus(request.httpStatus);
        log.setRequestMethod(request.httpMethod);
        log.setEndpoint(request.requestPath);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public static class AuditLogRequest {
        public String action;
        public String entityType;
        public String entityId;
        public Long performedBy;
        public String performedByName;
        public String details;
        public String httpStatus;
        public String httpMethod;
        public String requestPath;
    }
}
