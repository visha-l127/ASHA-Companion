package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HEALTH_RISK_ASSESSMENTS", indexes = {
    @Index(name = "idx_risk_pat", columnList = "patientId"),
    @Index(name = "idx_risk_phc", columnList = "phcId"),
    @Index(name = "idx_risk_level", columnList = "riskLevel")
})
public class HealthRiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "risk_assess_seq")
    @SequenceGenerator(name = "risk_assess_seq", sequenceName = "HEALTH_RISK_ASSESSMENT_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private String phcId;

    @Column(nullable = false, length = 50)
    private String assessmentType;

    @Column(nullable = false, length = 30)
    private String riskLevel;

    @Column(length = 20)
    private String riskScore;

    @Column(length = 4000)
    private String riskFactors;

    private LocalDateTime assessedAt;

    private Long assessedBy;

    @Column(nullable = false)
    private Integer active = 1;

    public HealthRiskAssessment() {
        this.assessedAt = LocalDateTime.now();
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

    public String getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(String assessmentType) {
        this.assessmentType = assessmentType;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(String riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
    }

    public LocalDateTime getAssessedAt() {
        return assessedAt;
    }

    public void setAssessedAt(LocalDateTime assessedAt) {
        this.assessedAt = assessedAt;
    }

    public Long getAssessedBy() {
        return assessedBy;
    }

    public void setAssessedBy(Long assessedBy) {
        this.assessedBy = assessedBy;
    }

    public Integer getActive() {
        return active;
    }

    public void setActive(Integer active) {
        this.active = active;
    }

    public boolean isActive() {
        return active != null && active == 1;
    }

    public void setActive(boolean active) {
        this.active = active ? 1 : 0;
    }
}
