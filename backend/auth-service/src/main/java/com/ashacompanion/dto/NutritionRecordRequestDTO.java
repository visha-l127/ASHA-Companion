package com.ashacompanion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class NutritionRecordRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Measurement date is required")
    @jakarta.validation.constraints.PastOrPresent(message = "Measurement date cannot be in the future")
    private LocalDate measurementDate;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight in kg must be a positive number")
    private Double weightKg;

    @NotNull(message = "Height is required")
    @Positive(message = "Height in cm must be a positive number")
    private Double heightCm;

    @Positive(message = "MUAC in cm must be a positive number if provided")
    private Double muacCm;

    @NotNull(message = "Age in months is required")
    @Min(value = 0, message = "Age in months cannot be negative")
    private Integer ageMonths;

    private String feedingType;
    private String notes;

    public NutritionRecordRequestDTO() {
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
