package com.ashacompanion.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class NutritionRecord {

    private Long id;

    private Patient patient;

    private LocalDate measurementDate;

    private Double weightKg;

    private Double heightCm;

    private Double muacCm;

    private Integer ageMonths;

    private String feedingType;

    private NutritionStatus nutritionStatus;

    private Integer riskFlag = 0;

    private String riskFactors;

    private String notes;

    private Long recordedByUserId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public NutritionRecord() {
    }

    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

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
}
