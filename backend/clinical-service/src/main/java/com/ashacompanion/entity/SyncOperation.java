package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SYNC_OPERATIONS", indexes = {
    @Index(name = "idx_sync_op_id", columnList = "operationId", unique = true),
    @Index(name = "idx_sync_op_user", columnList = "userId"),
    @Index(name = "idx_sync_op_phc", columnList = "phcId"),
    @Index(name = "idx_sync_op_status", columnList = "status")
})
public class SyncOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sync_op_seq")
    @SequenceGenerator(name = "sync_op_seq", sequenceName = "SYNC_OPERATION_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String operationId;

    @Column(nullable = false, length = 50)
    private String entityType;

    @Column(nullable = false, length = 100)
    private String entityId;

    @Column(nullable = false, length = 50)
    private String operationType;

    @Lob
    @Column(length = 4000)
    private String payload;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(length = 50)
    private String conflictType;

    @Column(length = 500)
    private String errorMessage;

    @Column(nullable = false)
    private Long userId;

    private String phcId;

    private LocalDateTime clientTimestamp;

    private LocalDateTime serverTimestamp;

    private LocalDateTime processedAt;

    private Integer retryCount = 0;

    public SyncOperation() {
        this.serverTimestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
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

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public LocalDateTime getClientTimestamp() {
        return clientTimestamp;
    }

    public void setClientTimestamp(LocalDateTime clientTimestamp) {
        this.clientTimestamp = clientTimestamp;
    }

    public LocalDateTime getServerTimestamp() {
        return serverTimestamp;
    }

    public void setServerTimestamp(LocalDateTime serverTimestamp) {
        this.serverTimestamp = serverTimestamp;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }
}
