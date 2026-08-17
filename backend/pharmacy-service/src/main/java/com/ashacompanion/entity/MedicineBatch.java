package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_batches", indexes = {
    @Index(name = "idx_batch_phc", columnList = "phc_id"),
    @Index(name = "idx_batch_med", columnList = "medicine_id"),
    @Index(name = "idx_batch_expiry", columnList = "expiry_date"),
    @Index(name = "idx_batch_number", columnList = "batch_number")
})
public class MedicineBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medicine_batch_seq")
    @SequenceGenerator(
        name = "medicine_batch_seq",
        sequenceName = "MEDICINE_BATCH_SEQ",
        allocationSize = 1
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "batch_number", nullable = false)
    private String batchNumber;

    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "original_quantity", nullable = false)
    private Integer originalQuantity = 0;

    private String unit;

    @Column(name = "phc_id", nullable = false)
    private String phcId;

    @Column(name = "received_at", nullable = false, updatable = false)
    private LocalDateTime receivedAt;

    @Column(name = "received_by_user_id", nullable = false)
    private Long receivedByUserId;

    @Column(name = "active_flag", nullable = false)
    private Integer activeFlag = 1;

    public MedicineBatch() {
    }

    @PrePersist
    protected void onCreate() {
        receivedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
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
        return activeFlag != null && activeFlag == 1;
    }

    public void setActive(boolean active) {
        this.activeFlag = active ? 1 : 0;
    }

    public Integer getActiveFlag() {
        return activeFlag;
    }

    public void setActiveFlag(Integer activeFlag) {
        this.activeFlag = activeFlag;
    }
}
