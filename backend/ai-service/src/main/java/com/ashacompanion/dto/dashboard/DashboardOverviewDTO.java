package com.ashacompanion.dto.dashboard;

public class DashboardOverviewDTO {
    private String phcId;
    private long totalPatients;
    private long activePatients;
    private long totalAshaWorkers;
    private long activePregnancies;
    private long highRiskPregnancies;
    private long totalAntenatalVisits;
    private long childrenWithImmunizationRecords;
    private long upcomingVaccinations;
    private long overdueVaccinations;
    private long highRiskNutritionRecords;
    private long lowStockMedicines;
    private long expiringMedicineBatches;

    public DashboardOverviewDTO() {
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
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

    public long getTotalAshaWorkers() {
        return totalAshaWorkers;
    }

    public void setTotalAshaWorkers(long totalAshaWorkers) {
        this.totalAshaWorkers = totalAshaWorkers;
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

    public long getTotalAntenatalVisits() {
        return totalAntenatalVisits;
    }

    public void setTotalAntenatalVisits(long totalAntenatalVisits) {
        this.totalAntenatalVisits = totalAntenatalVisits;
    }

    public long getChildrenWithImmunizationRecords() {
        return childrenWithImmunizationRecords;
    }

    public void setChildrenWithImmunizationRecords(long childrenWithImmunizationRecords) {
        this.childrenWithImmunizationRecords = childrenWithImmunizationRecords;
    }

    public long getUpcomingVaccinations() {
        return upcomingVaccinations;
    }

    public void setUpcomingVaccinations(long upcomingVaccinations) {
        this.upcomingVaccinations = upcomingVaccinations;
    }

    public long getOverdueVaccinations() {
        return overdueVaccinations;
    }

    public void setOverdueVaccinations(long overdueVaccinations) {
        this.overdueVaccinations = overdueVaccinations;
    }

    public long getHighRiskNutritionRecords() {
        return highRiskNutritionRecords;
    }

    public void setHighRiskNutritionRecords(long highRiskNutritionRecords) {
        this.highRiskNutritionRecords = highRiskNutritionRecords;
    }

    public long getLowStockMedicines() {
        return lowStockMedicines;
    }

    public void setLowStockMedicines(long lowStockMedicines) {
        this.lowStockMedicines = lowStockMedicines;
    }

    public long getExpiringMedicineBatches() {
        return expiringMedicineBatches;
    }

    public void setExpiringMedicineBatches(long expiringMedicineBatches) {
        this.expiringMedicineBatches = expiringMedicineBatches;
    }
}
