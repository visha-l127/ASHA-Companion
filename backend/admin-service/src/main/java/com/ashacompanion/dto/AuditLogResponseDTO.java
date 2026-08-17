package com.ashacompanion.dto;

import com.ashacompanion.entity.AuditLog;
import java.time.LocalDateTime;

public class AuditLogResponseDTO {

    private Long id;
    private String action;
    private String entityType;
    private String entityId;
    private Long performedBy;
    private String performedUsername;
    private String role;
    private String phcId;
    private String description;
    private String requestMethod;
    private String endpoint;
    private LocalDateTime timestamp;
    private String status;

    public AuditLogResponseDTO() {
    }

    public AuditLogResponseDTO(AuditLog log) {
        if (log != null) {
            this.id = log.getId();
            this.action = log.getAction();
            this.entityType = log.getEntityType();
            this.entityId = log.getEntityId();
            this.performedBy = log.getPerformedBy();
            this.performedUsername = log.getPerformedUsername();
            this.role = log.getRole();
            this.phcId = log.getPhcId();
            this.description = log.getDescription();
            this.requestMethod = log.getRequestMethod();
            this.endpoint = log.getEndpoint();
            this.timestamp = log.getTimestamp();
            this.status = log.getStatus();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public Long getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(Long performedBy) {
        this.performedBy = performedBy;
    }

    public String getPerformedUsername() {
        return performedUsername;
    }

    public void setPerformedUsername(String performedUsername) {
        this.performedUsername = performedUsername;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequestMethod() {
        return requestMethod;
    }

    public void setRequestMethod(String requestMethod) {
        this.requestMethod = requestMethod;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
