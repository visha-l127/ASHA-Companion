package com.ashacompanion.dto;

public class HealthRiskSummaryDTO {
    private long totalEvaluated;
    private long highRiskMaternal;
    private long overdueImmunization;
    private long highRiskNutrition;

    public HealthRiskSummaryDTO() {
    }

    public HealthRiskSummaryDTO(long totalEvaluated, long highRiskMaternal, long overdueImmunization, long highRiskNutrition) {
        this.totalEvaluated = totalEvaluated;
        this.highRiskMaternal = highRiskMaternal;
        this.overdueImmunization = overdueImmunization;
        this.highRiskNutrition = highRiskNutrition;
    }

    public long getTotalEvaluated() {
        return totalEvaluated;
    }

    public void setTotalEvaluated(long totalEvaluated) {
        this.totalEvaluated = totalEvaluated;
    }

    public long getHighRiskMaternal() {
        return highRiskMaternal;
    }

    public void setHighRiskMaternal(long highRiskMaternal) {
        this.highRiskMaternal = highRiskMaternal;
    }

    public long getOverdueImmunization() {
        return overdueImmunization;
    }

    public void setOverdueImmunization(long overdueImmunization) {
        this.overdueImmunization = overdueImmunization;
    }

    public long getHighRiskNutrition() {
        return highRiskNutrition;
    }

    public void setHighRiskNutrition(long highRiskNutrition) {
        this.highRiskNutrition = highRiskNutrition;
    }
}
