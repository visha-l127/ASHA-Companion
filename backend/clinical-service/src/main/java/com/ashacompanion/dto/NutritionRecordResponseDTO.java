package com.ashacompanion.dto;

import com.ashacompanion.entity.NutritionRecord;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class NutritionRecordResponseDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private LocalDate measurementDate;
    private Double weightKg;
    private Double heightCm;
    private Double muacCm;
    private Integer ageMonths;
    private String feedingType;
    private String nutritionStatus;
    private boolean riskFlag;
    private String riskFactors;
    private String notes;
    private Long recordedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public NutritionRecordResponseDTO() {
    }

    public NutritionRecordResponseDTO(NutritionRecord record) {
        if (record != null) {
            this.id = record.getId();
            if (record.getPatient() != null) {
                this.patientId = record.getPatient().getId();
                this.patientName = record.getPatient().getName();
            }
            this.measurementDate = record.getMeasurementDate();
            this.weightKg = record.getWeightKg();
            this.heightCm = record.getHeightCm();
            this.muacCm = record.getMuacCm();
            this.ageMonths = record.getAgeMonths();
            this.feedingType = record.getFeedingType();
            if (record.getNutritionStatus() != null) {
                this.nutritionStatus = record.getNutritionStatus().name();
            }
            this.riskFlag = record.isRiskFlag();
            this.riskFactors = record.getRiskFactors();
            this.notes = record.getNotes();
            this.recordedByUserId = record.getRecordedByUserId();
            this.createdAt = record.getCreatedAt();
            this.updatedAt = record.getUpdatedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
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

    public String getNutritionStatus() {
        return nutritionStatus;
    }

    public void setNutritionStatus(String nutritionStatus) {
        this.nutritionStatus = nutritionStatus;
    }

    public boolean isRiskFlag() {
        return riskFlag;
    }

    public void setRiskFlag(boolean riskFlag) {
        this.riskFlag = riskFlag;
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
