package com.ashacompanion.dto.sync;

import com.ashacompanion.entity.SyncOperation;
import java.time.LocalDateTime;

public class SyncOperationResponseDTO {

    private String operationId;
    private String entityType;
    private String entityId;
    private String operationType;
    private String status;
    private String conflictType;
    private String message;
    private LocalDateTime serverTimestamp;

    public SyncOperationResponseDTO() {
        this.serverTimestamp = LocalDateTime.now();
    }

    public SyncOperationResponseDTO(String operationId, String entityType, String entityId, String operationType, String status, String conflictType, String message) {
        this.operationId = operationId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.operationType = operationType;
        this.status = status;
        this.conflictType = conflictType;
        this.message = message;
        this.serverTimestamp = LocalDateTime.now();
    }

    public SyncOperationResponseDTO(SyncOperation entity) {
        this.operationId = entity.getOperationId();
        this.entityType = entity.getEntityType();
        this.entityId = entity.getEntityId();
        this.operationType = entity.getOperationType();
        this.status = entity.getStatus();
        this.conflictType = entity.getConflictType();
        this.message = entity.getErrorMessage();
        this.serverTimestamp = entity.getServerTimestamp();
    }

    public String getOperationId() {
        return operationId;
    }

    public void setOperationId(String operationId) {
        this.operationId = operationId;
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

    public String getOperationType() {
        return operationType;
    }

    public void setOperationType(String operationType) {
        this.operationType = operationType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getConflictType() {
        return conflictType;
    }

    public void setConflictType(String conflictType) {
        this.conflictType = conflictType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getServerTimestamp() {
        return serverTimestamp;
    }

    public void setServerTimestamp(LocalDateTime serverTimestamp) {
        this.serverTimestamp = serverTimestamp;
    }
}
