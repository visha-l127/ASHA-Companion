package com.ashacompanion.ai.dto;

import java.util.List;

public class MaternalAIResponseDTO {
    private Long pregnancyId;
    private Long patientId;
    private String patientName;
    private String riskLevel; // LOW, MODERATE, HIGH
    private Double riskScore;
    private Double confidence;
    private List<String> factors;
    private String explanation;
    private String recommendedAction;
    private String disclaimer;

    public MaternalAIResponseDTO() {
    }

    public MaternalAIResponseDTO(Long pregnancyId, Long patientId, String patientName, String riskLevel, Double riskScore, Double confidence, List<String> factors, String explanation, String recommendedAction, String disclaimer) {
        this.pregnancyId = pregnancyId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.riskLevel = riskLevel;
        this.riskScore = riskScore;
        this.confidence = confidence;
        this.factors = factors;
        this.explanation = explanation;
        this.recommendedAction = recommendedAction;
        this.disclaimer = disclaimer;
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

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public List<String> getFactors() {
        return factors;
    }

    public void setFactors(List<String> factors) {
        this.factors = factors;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
