package com.ashacompanion.dto;

import com.ashacompanion.entity.AntenatalVisit;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AntenatalVisitResponseDTO {
    private Long id;
    private Long pregnancyId;
    private LocalDate visitDate;
    private BigDecimal weight;
    private Integer systolicBp;
    private Integer diastolicBp;
    private BigDecimal hemoglobin;
    private Integer fetalHeartRate;
    private String dangerSigns;
    private String symptoms;
    private String clinicalNotes;
    private LocalDate nextVisitDate;
    private boolean highRisk;
    private String riskNotes;
    private Long recordedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;

    public AntenatalVisitResponseDTO() {
    }

    public AntenatalVisitResponseDTO(AntenatalVisit visit) {
        if (visit != null) {
            this.id = visit.getId();
            if (visit.getPregnancy() != null) {
                this.pregnancyId = visit.getPregnancy().getId();
            }
            this.visitDate = visit.getVisitDate();
            this.weight = visit.getWeight();
            this.systolicBp = visit.getSystolicBp();
            this.diastolicBp = visit.getDiastolicBp();
            this.hemoglobin = visit.getHemoglobin();
            this.fetalHeartRate = visit.getFetalHeartRate();
            this.dangerSigns = visit.getDangerSigns();
            this.symptoms = visit.getSymptoms();
            this.clinicalNotes = visit.getClinicalNotes();
            this.nextVisitDate = visit.getNextVisitDate();
            this.highRisk = visit.isHighRisk();
            this.riskNotes = visit.getRiskNotes();
            this.recordedByUserId = visit.getRecordedByUserId();
            this.createdAt = visit.getCreatedAt();
            this.updatedAt = visit.getUpdatedAt();
            this.active = visit.isActive();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPregnancyId() {
        return pregnancyId;
    }

    public void setPregnancyId(Long pregnancyId) {
        this.pregnancyId = pregnancyId;
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

    public boolean isHighRisk() {
        return highRisk;
    }

    public void setHighRisk(boolean highRisk) {
        this.highRisk = highRisk;
    }

    public String getRiskNotes() {
        return riskNotes;
    }

    public void setRiskNotes(String riskNotes) {
        this.riskNotes = riskNotes;
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
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
