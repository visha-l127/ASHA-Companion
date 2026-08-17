package com.ashacompanion.dto;

public class HealthRiskAssessmentRequestDTO {
    private Long patientId;
    private String assessmentType;

    public HealthRiskAssessmentRequestDTO() {
    }

    public HealthRiskAssessmentRequestDTO(Long patientId, String assessmentType) {
        this.patientId = patientId;
        this.assessmentType = assessmentType;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(String assessmentType) {
        this.assessmentType = assessmentType;
    }
}
