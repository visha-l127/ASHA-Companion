package com.ashacompanion.ai.dto;

public class MedicineForecastResponseDTO {
    private String medicineCode;
    private String medicineName;
    private String phcId;
    private Integer currentStock;
    private Integer estimatedDemand;
    private Integer forecastPeriodDays;
    private String stockoutRisk; // LOW, MEDIUM, HIGH
    private Integer recommendedReorderQuantity;
    private String status; // OK, INSUFFICIENT_DATA
    private String explanation;
    private String disclaimer;

    public MedicineForecastResponseDTO() {
    }

    public MedicineForecastResponseDTO(String medicineCode, String medicineName, String phcId, Integer currentStock, Integer estimatedDemand, Integer forecastPeriodDays, String stockoutRisk, Integer recommendedReorderQuantity, String status, String explanation, String disclaimer) {
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.phcId = phcId;
        this.currentStock = currentStock;
        this.estimatedDemand = estimatedDemand;
        this.forecastPeriodDays = forecastPeriodDays;
        this.stockoutRisk = stockoutRisk;
        this.recommendedReorderQuantity = recommendedReorderQuantity;
        this.status = status;
        this.explanation = explanation;
        this.disclaimer = disclaimer;
    }

    public String getMedicineCode() {
        return medicineCode;
    }

    public void setMedicineCode(String medicineCode) {
        this.medicineCode = medicineCode;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Integer getEstimatedDemand() {
        return estimatedDemand;
    }

    public void setEstimatedDemand(Integer estimatedDemand) {
        this.estimatedDemand = estimatedDemand;
    }

    public Integer getForecastPeriodDays() {
        return forecastPeriodDays;
    }

    public void setForecastPeriodDays(Integer forecastPeriodDays) {
        this.forecastPeriodDays = forecastPeriodDays;
    }

    public String getStockoutRisk() {
        return stockoutRisk;
    }

    public void setStockoutRisk(String stockoutRisk) {
        this.stockoutRisk = stockoutRisk;
    }

    public Integer getRecommendedReorderQuantity() {
        return recommendedReorderQuantity;
    }

    public void setRecommendedReorderQuantity(Integer recommendedReorderQuantity) {
        this.recommendedReorderQuantity = recommendedReorderQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
