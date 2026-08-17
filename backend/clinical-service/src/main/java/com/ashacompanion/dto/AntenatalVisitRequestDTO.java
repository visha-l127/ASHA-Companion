package com.ashacompanion.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class AntenatalVisitRequestDTO {

    @NotNull(message = "Visit date is required")
    @jakarta.validation.constraints.PastOrPresent(message = "Visit date cannot be in the future")
    private LocalDate visitDate;

    @Positive(message = "Weight must be positive")
    private BigDecimal weight;

    @Positive(message = "Systolic BP must be positive")
    private Integer systolicBp;

    @Positive(message = "Diastolic BP must be positive")
    private Integer diastolicBp;

    @Positive(message = "Hemoglobin level must be positive")
    private BigDecimal hemoglobin;

    @Positive(message = "Fetal heart rate must be positive")
    private Integer fetalHeartRate;

    private String dangerSigns;
    private String symptoms;
    private String clinicalNotes;
    private LocalDate nextVisitDate;

    public AntenatalVisitRequestDTO() {
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public Integer getSystolicBp() {
        return systolicBp;
    }

    public void setSystolicBp(Integer systolicBp) {
        this.systolicBp = systolicBp;
    }

    public Integer getDiastolicBp() {
        return diastolicBp;
    }

    public void setDiastolicBp(Integer diastolicBp) {
        this.diastolicBp = diastolicBp;
    }

    public BigDecimal getHemoglobin() {
        return hemoglobin;
    }

    public void setHemoglobin(BigDecimal hemoglobin) {
        this.hemoglobin = hemoglobin;
    }

    public Integer getFetalHeartRate() {
        return fetalHeartRate;
    }

    public void setFetalHeartRate(Integer fetalHeartRate) {
        this.fetalHeartRate = fetalHeartRate;
    }

    public String getDangerSigns() {
        return dangerSigns;
    }

    public void setDangerSigns(String dangerSigns) {
        this.dangerSigns = dangerSigns;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public LocalDate getNextVisitDate() {
        return nextVisitDate;
    }

    public void setNextVisitDate(LocalDate nextVisitDate) {
        this.nextVisitDate = nextVisitDate;
    }
}
