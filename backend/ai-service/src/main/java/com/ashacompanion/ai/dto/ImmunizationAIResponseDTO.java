package com.ashacompanion.ai.dto;

import java.util.List;

public class ImmunizationAIResponseDTO {
    private Long patientId;
    private String patientName;
    private String status; // ON_TRACK, UPCOMING, OVERDUE, HIGH_PRIORITY
    private Double riskScore;
    private List<String> missedVaccines;
    private List<String> upcomingVaccines;
    private String explanation;
    private String recommendedAction;
    private String disclaimer;

    public ImmunizationAIResponseDTO() {
    }

    public ImmunizationAIResponseDTO(Long patientId, String patientName, String status, Double riskScore, List<String> missedVaccines, List<String> upcomingVaccines, String explanation, String recommendedAction, String disclaimer) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.status = status;
        this.riskScore = riskScore;
        this.missedVaccines = missedVaccines;
        this.upcomingVaccines = upcomingVaccines;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public List<String> getMissedVaccines() {
        return missedVaccines;
    }

    public void setMissedVaccines(List<String> missedVaccines) {
        this.missedVaccines = missedVaccines;
    }

    public List<String> getUpcomingVaccines() {
        return upcomingVaccines;
    }

    public void setUpcomingVaccines(List<String> upcomingVaccines) {
        this.upcomingVaccines = upcomingVaccines;
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
