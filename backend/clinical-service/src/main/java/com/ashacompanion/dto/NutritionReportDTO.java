package com.ashacompanion.dto;

public class NutritionReportDTO {
    private long totalNutritionRecords;
    private long normalCount;
    private long atRiskCount;
    private long moderateRiskCount;
    private long highRiskCount;
    private long latestHighRiskCount;

    public NutritionReportDTO() {
    }

    public long getTotalNutritionRecords() {
        return totalNutritionRecords;
    }

    public void setTotalNutritionRecords(long totalNutritionRecords) {
        this.totalNutritionRecords = totalNutritionRecords;
    }

    public long getNormalCount() {
        return normalCount;
    }

    public void setNormalCount(long normalCount) {
        this.normalCount = normalCount;
    }

    public long getAtRiskCount() {
        return atRiskCount;
    }

    public void setAtRiskCount(long atRiskCount) {
        this.atRiskCount = atRiskCount;
    }

    public long getModerateRiskCount() {
        return moderateRiskCount;
    }

    public void setModerateRiskCount(long moderateRiskCount) {
        this.moderateRiskCount = moderateRiskCount;
    }

    public long getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(long highRiskCount) {
        this.highRiskCount = highRiskCount;
    }

    public long getLatestHighRiskCount() {
        return latestHighRiskCount;
    }

    public void setLatestHighRiskCount(long latestHighRiskCount) {
        this.latestHighRiskCount = latestHighRiskCount;
    }
}
