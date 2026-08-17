package com.ashacompanion.ai.dto;

public class PatientAIOverviewDTO {
    private Long patientId;
    private String patientName;
    private MaternalAIResponseDTO maternalAssessment;
    private ImmunizationAIResponseDTO immunizationAssessment;
    private NutritionAIResponseDTO nutritionAssessment;
    private String overallRiskSummary;

    public PatientAIOverviewDTO() {
    }

    public PatientAIOverviewDTO(Long patientId, String patientName, MaternalAIResponseDTO maternalAssessment, ImmunizationAIResponseDTO immunizationAssessment, NutritionAIResponseDTO nutritionAssessment, String overallRiskSummary) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.maternalAssessment = maternalAssessment;
        this.immunizationAssessment = immunizationAssessment;
        this.nutritionAssessment = nutritionAssessment;
        this.overallRiskSummary = overallRiskSummary;
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

    public MaternalAIResponseDTO getMaternalAssessment() {
        return maternalAssessment;
    }

    public void setMaternalAssessment(MaternalAIResponseDTO maternalAssessment) {
        this.maternalAssessment = maternalAssessment;
    }

    public ImmunizationAIResponseDTO getImmunizationAssessment() {
        return immunizationAssessment;
    }

    public void setImmunizationAssessment(ImmunizationAIResponseDTO immunizationAssessment) {
        this.immunizationAssessment = immunizationAssessment;
    }

    public NutritionAIResponseDTO getNutritionAssessment() {
        return nutritionAssessment;
    }

    public void setNutritionAssessment(NutritionAIResponseDTO nutritionAssessment) {
        this.nutritionAssessment = nutritionAssessment;
    }

    public String getOverallRiskSummary() {
        return overallRiskSummary;
    }

    public void setOverallRiskSummary(String overallRiskSummary) {
        this.overallRiskSummary = overallRiskSummary;
    }
}
