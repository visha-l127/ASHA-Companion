package com.ashacompanion.dto;

import java.time.LocalDateTime;

public class HealthAlertDTO {
    private String alertId;
    private Long patientId;
    private String patientName;
    private String alertType;
    private String severity;
    private String title;
    private String message;
    private LocalDateTime generatedAt;
    private String source;

    public HealthAlertDTO() {
        this.generatedAt = LocalDateTime.now();
    }

    public HealthAlertDTO(String alertId, Long patientId, String patientName, String alertType, String severity, String title, String message, String source) {
        this.alertId = alertId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.alertType = alertType;
        this.severity = severity;
        this.title = title;
        this.message = message;
        this.generatedAt = LocalDateTime.now();
        this.source = source;
    }

    public String getAlertId() {
        return alertId;
    }

    public void setAlertId(String alertId) {
        this.alertId = alertId;
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

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
