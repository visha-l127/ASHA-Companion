package com.ashacompanion.ai.dto;

public class AIDashboardSummaryDTO {
    private long highRiskMaternalCount;
    private long immunizationDefaulterCount;
    private long nutritionRiskCount;
    private long medicineStockoutRiskCount;
    private long medicineExpiryRiskCount;

    public AIDashboardSummaryDTO() {
    }

    public AIDashboardSummaryDTO(long highRiskMaternalCount, long immunizationDefaulterCount, long nutritionRiskCount, long medicineStockoutRiskCount, long medicineExpiryRiskCount) {
        this.highRiskMaternalCount = highRiskMaternalCount;
        this.immunizationDefaulterCount = immunizationDefaulterCount;
        this.nutritionRiskCount = nutritionRiskCount;
        this.medicineStockoutRiskCount = medicineStockoutRiskCount;
        this.medicineExpiryRiskCount = medicineExpiryRiskCount;
    }

    public long getHighRiskMaternalCount() {
        return highRiskMaternalCount;
    }

    public void setHighRiskMaternalCount(long highRiskMaternalCount) {
        this.highRiskMaternalCount = highRiskMaternalCount;
    }

    public long getImmunizationDefaulterCount() {
        return immunizationDefaulterCount;
    }

    public void setImmunizationDefaulterCount(long immunizationDefaulterCount) {
        this.immunizationDefaulterCount = immunizationDefaulterCount;
    }

    public long getNutritionRiskCount() {
        return nutritionRiskCount;
    }

    public void setNutritionRiskCount(long nutritionRiskCount) {
        this.nutritionRiskCount = nutritionRiskCount;
    }

    public long getMedicineStockoutRiskCount() {
        return medicineStockoutRiskCount;
    }

    public void setMedicineStockoutRiskCount(long medicineStockoutRiskCount) {
        this.medicineStockoutRiskCount = medicineStockoutRiskCount;
    }

    public long getMedicineExpiryRiskCount() {
        return medicineExpiryRiskCount;
    }

    public void setMedicineExpiryRiskCount(long medicineExpiryRiskCount) {
        this.medicineExpiryRiskCount = medicineExpiryRiskCount;
    }
}
