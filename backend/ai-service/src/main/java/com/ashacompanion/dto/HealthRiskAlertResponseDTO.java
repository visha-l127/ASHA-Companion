package com.ashacompanion.dto;

import com.ashacompanion.entity.HealthRiskAlert;
import java.time.LocalDateTime;

public class HealthRiskAlertResponseDTO {

    private Long id;
    private Long patientId;
    private String patientName;
    private String phcId;
    private String alertType;
    private String severity;
    private String title;
    private String message;
    private String riskFactors;
    private boolean acknowledged;
    private Long generatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime acknowledgedAt;
    private Long acknowledgedBy;

    public HealthRiskAlertResponseDTO() {
    }

    public HealthRiskAlertResponseDTO(HealthRiskAlert alert) {
        if (alert != null) {
            this.id = alert.getId();
            this.patientId = alert.getPatientId();
            this.phcId = alert.getPhcId();
            this.alertType = alert.getAlertType();
            this.severity = alert.getSeverity();
            this.title = alert.getTitle();
            this.message = alert.getMessage();
            this.riskFactors = alert.getRiskFactors();
            this.acknowledged = alert.isAcknowledged();
            this.generatedBy = alert.getGeneratedBy();
            this.createdAt = alert.getCreatedAt();
            this.acknowledgedAt = alert.getAcknowledgedAt();
            this.acknowledgedBy = alert.getAcknowledgedBy();
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

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
    }

    public boolean isAcknowledged() {
        return acknowledged;
    }

    public void setAcknowledged(boolean acknowledged) {
        this.acknowledged = acknowledged;
    }

    public Long getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(Long generatedBy) {
        this.generatedBy = generatedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public Long getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(Long acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }
}
