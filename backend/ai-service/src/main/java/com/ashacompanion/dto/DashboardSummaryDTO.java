package com.ashacompanion.dto;

public class DashboardSummaryDTO {
    private long totalPatients;
    private long activePatients;
    private long totalPregnancies;
    private long activePregnancies;
    private long highRiskPregnancies;
    private long pendingANCVisits;
    private long overdueANCVisits;
    private long childrenCount;
    private long immunizationsDue;
    private long immunizationsOverdue;
    private long nutritionAtRiskCount;
    private long nutritionHighRiskCount;
    private long lowStockMedicineCount;
    private long expiringMedicineBatchCount;
    private long totalAlerts;

    public DashboardSummaryDTO() {
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getActivePatients() {
        return activePatients;
    }

    public void setActivePatients(long activePatients) {
        this.activePatients = activePatients;
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

    public long getPendingANCVisits() {
        return pendingANCVisits;
    }

    public void setPendingANCVisits(long pendingANCVisits) {
        this.pendingANCVisits = pendingANCVisits;
    }

    public long getOverdueANCVisits() {
        return overdueANCVisits;
    }

    public void setOverdueANCVisits(long overdueANCVisits) {
        this.overdueANCVisits = overdueANCVisits;
    }

    public long getChildrenCount() {
        return childrenCount;
    }

    public void setChildrenCount(long childrenCount) {
        this.childrenCount = childrenCount;
    }

    public long getImmunizationsDue() {
        return immunizationsDue;
    }

    public void setImmunizationsDue(long immunizationsDue) {
        this.immunizationsDue = immunizationsDue;
    }

    public long getImmunizationsOverdue() {
        return immunizationsOverdue;
    }

    public void setImmunizationsOverdue(long immunizationsOverdue) {
        this.immunizationsOverdue = immunizationsOverdue;
    }

    public long getNutritionAtRiskCount() {
        return nutritionAtRiskCount;
    }

    public void setNutritionAtRiskCount(long nutritionAtRiskCount) {
        this.nutritionAtRiskCount = nutritionAtRiskCount;
    }

    public long getNutritionHighRiskCount() {
        return nutritionHighRiskCount;
    }

    public void setNutritionHighRiskCount(long nutritionHighRiskCount) {
        this.nutritionHighRiskCount = nutritionHighRiskCount;
    }

    public long getLowStockMedicineCount() {
        return lowStockMedicineCount;
    }

    public void setLowStockMedicineCount(long lowStockMedicineCount) {
        this.lowStockMedicineCount = lowStockMedicineCount;
    }

    public long getExpiringMedicineBatchCount() {
        return expiringMedicineBatchCount;
    }

    public void setExpiringMedicineBatchCount(long expiringMedicineBatchCount) {
        this.expiringMedicineBatchCount = expiringMedicineBatchCount;
    }

    public long getTotalAlerts() {
        return totalAlerts;
    }

    public void setTotalAlerts(long totalAlerts) {
        this.totalAlerts = totalAlerts;
    }
}
