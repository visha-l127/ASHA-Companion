package com.ashacompanion.dto.sync;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SyncOperationRequestDTO {

    @NotBlank(message = "operationId is required")
    private String operationId;

    @NotBlank(message = "entityType is required")
    private String entityType;

    @NotBlank(message = "entityId is required")
    private String entityId;

    @NotBlank(message = "operationType is required")
    private String operationType;

    @NotNull(message = "payload is required")
    private Object payload;

    @NotNull(message = "clientTimestamp is required")
    private LocalDateTime clientTimestamp;

    private LocalDateTime clientUpdatedAt;

    public SyncOperationRequestDTO() {
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

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }

    public LocalDateTime getClientTimestamp() {
        return clientTimestamp;
    }

    public void setClientTimestamp(LocalDateTime clientTimestamp) {
        this.clientTimestamp = clientTimestamp;
    }

    public LocalDateTime getClientUpdatedAt() {
        return clientUpdatedAt;
    }

    public void setClientUpdatedAt(LocalDateTime clientUpdatedAt) {
        this.clientUpdatedAt = clientUpdatedAt;
    }
}
