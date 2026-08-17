package com.ashacompanion.ai.dto;

import java.util.List;

public class NutritionAIResponseDTO {
    private Long patientId;
    private String patientName;
    private String riskLevel; // NORMAL, AT_RISK, MODERATE, HIGH
    private String trend; // IMPROVING, STABLE, DECLINING
    private Double riskScore;
    private List<String> factors;
    private String explanation;
    private String recommendedAction;
    private String disclaimer;

    public NutritionAIResponseDTO() {
    }

    public NutritionAIResponseDTO(Long patientId, String patientName, String riskLevel, String trend, Double riskScore, List<String> factors, String explanation, String recommendedAction, String disclaimer) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.riskLevel = riskLevel;
        this.trend = trend;
        this.riskScore = riskScore;
        this.factors = factors;
        this.explanation = explanation;
        this.recommendedAction = recommendedAction;
        this.disclaimer = disclaimer;
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

    public String getTrend() {
        return trend;
    }

    public void setTrend(String trend) {
        this.trend = trend;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
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
