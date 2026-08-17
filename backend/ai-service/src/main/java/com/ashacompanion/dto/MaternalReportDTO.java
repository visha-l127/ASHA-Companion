package com.ashacompanion.dto;

public class MaternalReportDTO {
    private long totalPregnancies;
    private long activePregnancies;
    private long deliveredPregnancies;
    private long completedPregnancies;
    private long cancelledPregnancies;
    private long highRiskPregnancies;
    private long recentAncVisitsCount;
    private long highRiskAncVisitsCount;

    public MaternalReportDTO() {
    }

    public long getTotalPregnancies() {
        return totalPregnancies;
    }

    public void setTotalPregnancies(long totalPregnancies) {
        this.totalPregnancies = totalPregnancies;
    }

    public long getActivePregnancies() {
        return activePregnancies;
    }

    public void setActivePregnancies(long activePregnancies) {
        this.activePregnancies = activePregnancies;
    }

    public long getDeliveredPregnancies() {
        return deliveredPregnancies;
    }

    public void setDeliveredPregnancies(long deliveredPregnancies) {
        this.deliveredPregnancies = deliveredPregnancies;
    }

    public long getCompletedPregnancies() {
        return completedPregnancies;
    }

    public void setCompletedPregnancies(long completedPregnancies) {
        this.completedPregnancies = completedPregnancies;
    }

    public long getCancelledPregnancies() {
        return cancelledPregnancies;
    }

    public void setCancelledPregnancies(long cancelledPregnancies) {
        this.cancelledPregnancies = cancelledPregnancies;
    }

    public long getHighRiskPregnancies() {
        return highRiskPregnancies;
    }

    public void setHighRiskPregnancies(long highRiskPregnancies) {
        this.highRiskPregnancies = highRiskPregnancies;
    }

    public long getRecentAncVisitsCount() {
        return recentAncVisitsCount;
    }

    public void setRecentAncVisitsCount(long recentAncVisitsCount) {
        this.recentAncVisitsCount = recentAncVisitsCount;
    }

    public long getHighRiskAncVisitsCount() {
        return highRiskAncVisitsCount;
    }

    public void setHighRiskAncVisitsCount(long highRiskAncVisitsCount) {
        this.highRiskAncVisitsCount = highRiskAncVisitsCount;
    }
}
