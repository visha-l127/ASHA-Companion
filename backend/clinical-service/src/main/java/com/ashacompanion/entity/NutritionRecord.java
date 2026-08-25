package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_records")
public class NutritionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nutrition_record_seq")
    @SequenceGenerator(
        name = "nutrition_record_seq",
        sequenceName = "NUTRITION_RECORD_SEQ",
        allocationSize = 1
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "measurement_date", nullable = false)
    private LocalDate measurementDate;

    @Column(name = "weight_kg", nullable = false)
    private Double weightKg;

    @Column(name = "height_cm", nullable = false)
    private Double heightCm;

    @Column(name = "muac_cm")
    private Double muacCm;

    @Column(name = "age_months", nullable = false)
    private Integer ageMonths;

    @Column(name = "feeding_type")
    private String feedingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "nutrition_status", nullable = false)
    private NutritionStatus nutritionStatus;

    @Column(name = "risk_flag", nullable = false)
    private Integer riskFlag = 0;

    @Column(name = "risk_factors", length = 1000)
    private String riskFactors;

    @Column(length = 1000)
    private String notes;

    @Column(name = "recorded_by_user_id", nullable = false)
    private Long recordedByUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false, columnDefinition = "NUMBER(10,0) DEFAULT 1")
    private Integer active = 1;

    public NutritionRecord() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public LocalDate getMeasurementDate() {
        return measurementDate;
    }

    public void setMeasurementDate(LocalDate measurementDate) {
        this.measurementDate = measurementDate;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public Double getMuacCm() {
        return muacCm;
    }

    public void setMuacCm(Double muacCm) {
        this.muacCm = muacCm;
    }

    public Integer getAgeMonths() {
        return ageMonths;
    }

    public void setAgeMonths(Integer ageMonths) {
        this.ageMonths = ageMonths;
    }

    public String getFeedingType() {
        return feedingType;
    }

    public void setFeedingType(String feedingType) {
        this.feedingType = feedingType;
    }

    public NutritionStatus getNutritionStatus() {
        return nutritionStatus;
    }

    public void setNutritionStatus(NutritionStatus nutritionStatus) {
        this.nutritionStatus = nutritionStatus;
    }

    public boolean isRiskFlag() {
        return riskFlag != null && riskFlag == 1;
    }

    public void setRiskFlag(boolean riskFlag) {
        this.riskFlag = riskFlag ? 1 : 0;
    }

    public String getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getRecordedByUserId() {
        return recordedByUserId;
    }

    public void setRecordedByUserId(Long recordedByUserId) {
        this.recordedByUserId = recordedByUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return active != null && active == 1;
    }

    public void setActive(boolean active) {
        this.active = active ? 1 : 0;
    }

    public Integer getActive() {
        return active;
    }

    public void setActive(Integer active) {
        this.active = active;
    }
}
