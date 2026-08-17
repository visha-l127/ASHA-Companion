package com.ashacompanion.dto;

import com.ashacompanion.entity.HealthRiskAssessment;
import java.time.LocalDateTime;

public class HealthRiskAssessmentResponseDTO {

    private Long id;
    private Long patientId;
    private String patientName;
    private String phcId;
    private String assessmentType;
    private String riskLevel;
    private String riskScore;
    private String riskFactors;
    private LocalDateTime assessedAt;
    private Long assessedBy;

    public HealthRiskAssessmentResponseDTO() {
    }

    public HealthRiskAssessmentResponseDTO(HealthRiskAssessment entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.patientId = entity.getPatientId();
            this.phcId = entity.getPhcId();
            this.assessmentType = entity.getAssessmentType();
            this.riskLevel = entity.getRiskLevel();
            this.riskScore = entity.getRiskScore();
            this.riskFactors = entity.getRiskFactors();
            this.assessedAt = entity.getAssessedAt();
            this.assessedBy = entity.getAssessedBy();
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
}
