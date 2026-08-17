package com.ashacompanion.dto;

import com.ashacompanion.entity.MedicineBatch;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicineBatchResponseDTO {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private String batchNumber;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private Integer quantity;
    private Integer originalQuantity;
    private String unit;
    private String phcId;
    private LocalDateTime receivedAt;
    private Long receivedByUserId;
    private boolean active;
    private boolean expired;
    private boolean expiryRisk;

    public MedicineBatchResponseDTO() {
    }

    public MedicineBatchResponseDTO(MedicineBatch batch) {
        if (batch != null) {
            this.id = batch.getId();
            if (batch.getMedicine() != null) {
                this.medicineId = batch.getMedicine().getId();
                this.medicineName = batch.getMedicine().getName();
                this.medicineCode = batch.getMedicine().getCode();
            }
            this.batchNumber = batch.getBatchNumber();
            this.manufacturingDate = batch.getManufacturingDate();
            this.expiryDate = batch.getExpiryDate();
            this.quantity = batch.getQuantity();
            this.originalQuantity = batch.getOriginalQuantity();
            this.unit = batch.getUnit();
            this.phcId = batch.getPhcId();
            this.receivedAt = batch.getReceivedAt();
            this.receivedByUserId = batch.getReceivedByUserId();
            this.active = batch.isActive();
            
            LocalDate today = LocalDate.now();
            this.expired = batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(today);
            this.expiryRisk = batch.getExpiryDate() != null &&
                    !batch.getExpiryDate().isBefore(today) &&
                    !batch.getExpiryDate().isAfter(today.plusDays(30));
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getMedicineCode() {
        return medicineCode;
    }

    public void setMedicineCode(String medicineCode) {
        this.medicineCode = medicineCode;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public LocalDate getManufacturingDate() {
        return manufacturingDate;
    }

    public void setManufacturingDate(LocalDate manufacturingDate) {
        this.manufacturingDate = manufacturingDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getOriginalQuantity() {
        return originalQuantity;
    }

    public void setOriginalQuantity(Integer originalQuantity) {
        this.originalQuantity = originalQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public Long getReceivedByUserId() {
        return receivedByUserId;
    }

    public void setReceivedByUserId(Long receivedByUserId) {
        this.receivedByUserId = receivedByUserId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isExpired() {
        return expired;
    }

    public void setExpired(boolean expired) {
        this.expired = expired;
    }

    public boolean isExpiryRisk() {
        return expiryRisk;
    }

    public void setExpiryRisk(boolean expiryRisk) {
        this.expiryRisk = expiryRisk;
    }
}
