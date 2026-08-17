package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HEALTH_RISK_ALERTS", indexes = {
    @Index(name = "idx_alert_pat", columnList = "patientId"),
    @Index(name = "idx_alert_phc", columnList = "phcId"),
    @Index(name = "idx_alert_type", columnList = "alertType"),
    @Index(name = "idx_alert_ack", columnList = "acknowledged")
})
public class HealthRiskAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "risk_alert_seq")
    @SequenceGenerator(name = "risk_alert_seq", sequenceName = "HEALTH_RISK_ALERT_SEQ", allocationSize = 1)
    private Long id;

    private Long patientId;

    private String phcId;

    @Column(nullable = false, length = 50)
    private String alertType;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String message;

    @Column(length = 4000)
    private String riskFactors;

    @Column(nullable = false)
    private Integer acknowledged = 0;

    private Long generatedBy;

    private LocalDateTime createdAt;

    private LocalDateTime acknowledgedAt;

    private Long acknowledgedBy;

    public HealthRiskAlert() {
        this.createdAt = LocalDateTime.now();
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

    public Integer getAcknowledged() {
        return acknowledged;
    }

    public void setAcknowledged(Integer acknowledged) {
        this.acknowledged = acknowledged;
    }

    public boolean isAcknowledged() {
        return acknowledged != null && acknowledged == 1;
    }

    public void setAcknowledged(boolean acknowledged) {
        this.acknowledged = acknowledged ? 1 : 0;
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
