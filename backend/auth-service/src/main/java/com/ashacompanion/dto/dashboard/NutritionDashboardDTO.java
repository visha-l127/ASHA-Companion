package com.ashacompanion.dto.dashboard;

public class NutritionDashboardDTO {
    private long totalNutritionRecords;
    private long normalCount;
    private long atRiskCount;
    private long moderateRiskCount;
    private long highRiskCount;
    private long totalHighRiskChildren;

    public NutritionDashboardDTO() {
    }

    public NutritionDashboardDTO(long totalNutritionRecords, long normalCount, long atRiskCount, long moderateRiskCount, long highRiskCount, long totalHighRiskChildren) {
        this.totalNutritionRecords = totalNutritionRecords;
        this.normalCount = normalCount;
        this.atRiskCount = atRiskCount;
        this.moderateRiskCount = moderateRiskCount;
        this.highRiskCount = highRiskCount;
        this.totalHighRiskChildren = totalHighRiskChildren;
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

    public long getTotalHighRiskChildren() {
        return totalHighRiskChildren;
    }

    public void setTotalHighRiskChildren(long totalHighRiskChildren) {
        this.totalHighRiskChildren = totalHighRiskChildren;
    }
}
