package com.ashacompanion.dto;

import com.ashacompanion.entity.MedicineTransaction;
import java.time.LocalDateTime;

public class MedicineTransactionResponseDTO {
    private Long id;
    private Long batchId;
    private String medicineName;
    private String batchNumber;
    private String transactionType;
    private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String reason;
    private String reference;
    private String phcId;
    private Long performedByUserId;
    private LocalDateTime transactionTime;

    public MedicineTransactionResponseDTO() {
    }

    public MedicineTransactionResponseDTO(MedicineTransaction tx) {
        if (tx != null) {
            this.id = tx.getId();
            if (tx.getBatch() != null) {
                this.batchId = tx.getBatch().getId();
                this.batchNumber = tx.getBatch().getBatchNumber();
                if (tx.getBatch().getMedicine() != null) {
                    this.medicineName = tx.getBatch().getMedicine().getName();
                }
            }
            this.transactionType = tx.getTransactionType();
            this.quantity = tx.getQuantity();
            this.quantityBefore = tx.getQuantityBefore();
            this.quantityAfter = tx.getQuantityAfter();
            this.reason = tx.getReason();
            this.reference = tx.getReference();
            this.phcId = tx.getPhcId();
            this.performedByUserId = tx.getPerformedByUserId();
            this.transactionTime = tx.getTransactionTime();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getQuantityBefore() {
        return quantityBefore;
    }

    public void setQuantityBefore(Integer quantityBefore) {
        this.quantityBefore = quantityBefore;
    }

    public Integer getQuantityAfter() {
        return quantityAfter;
    }

    public void setQuantityAfter(Integer quantityAfter) {
        this.quantityAfter = quantityAfter;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public Long getPerformedByUserId() {
        return performedByUserId;
    }

    public void setPerformedByUserId(Long performedByUserId) {
        this.performedByUserId = performedByUserId;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(LocalDateTime transactionTime) {
        this.transactionTime = transactionTime;
    }
}
