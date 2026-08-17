package com.ashacompanion.dto.dashboard;

import java.time.LocalDate;

public class HighRiskPregnancyDTO {
    private Long pregnancyId;
    private Long patientId;
    private String patientName;
    private String phcId;
    private LocalDate expectedDeliveryDate;
    private String pregnancyStatus;
    private String riskFactors;
    private LocalDate lastAncVisitDate;

    public HighRiskPregnancyDTO() {
    }

    public Long getPregnancyId() {
        return pregnancyId;
    }

    public void setPregnancyId(Long pregnancyId) {
        this.pregnancyId = pregnancyId;
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

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public String getPregnancyStatus() {
        return pregnancyStatus;
    }

    public void setPregnancyStatus(String pregnancyStatus) {
        this.pregnancyStatus = pregnancyStatus;
    }

    public String getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
    }

    public LocalDate getLastAncVisitDate() {
        return lastAncVisitDate;
    }

    public void setLastAncVisitDate(LocalDate lastAncVisitDate) {
        this.lastAncVisitDate = lastAncVisitDate;
    }
}
