package com.ashacompanion.dto;

import java.time.LocalDate;

public class NutritionRecordUpdateRequestDTO {

    private Long patientId;
    private LocalDate measurementDate;
    private Double weightKg;
    private Double heightCm;
    private Double muacCm;
    private Integer ageMonths;
    private String feedingType;
    private String notes;

    public NutritionRecordUpdateRequestDTO() {
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
