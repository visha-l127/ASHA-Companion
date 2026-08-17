package com.ashacompanion.dto.dashboard;

public class MaternalDashboardDTO {
    private long totalPregnancies;
    private long activePregnancies;
    private long highRiskPregnancies;
    private long deliveredPregnancies;
    private long completedPregnancies;

    public MaternalDashboardDTO() {
    }

    public MaternalDashboardDTO(long totalPregnancies, long activePregnancies, long highRiskPregnancies, long deliveredPregnancies, long completedPregnancies) {
        this.totalPregnancies = totalPregnancies;
        this.activePregnancies = activePregnancies;
        this.highRiskPregnancies = highRiskPregnancies;
        this.deliveredPregnancies = deliveredPregnancies;
        this.completedPregnancies = completedPregnancies;
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

    public long getHighRiskPregnancies() {
        return highRiskPregnancies;
    }

    public void setHighRiskPregnancies(long highRiskPregnancies) {
        this.highRiskPregnancies = highRiskPregnancies;
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
}
