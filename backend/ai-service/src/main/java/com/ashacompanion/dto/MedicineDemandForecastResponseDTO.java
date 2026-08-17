package com.ashacompanion.dto;

import com.ashacompanion.entity.MedicineDemandForecast;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicineDemandForecastResponseDTO {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private String phcId;
    private LocalDate forecastDate;
    private Integer predictedDemand;
    private Integer currentStock;
    private Integer recommendedStock;
    private String riskLevel;
    private String explanation;
    private LocalDateTime generatedAt;

    public MedicineDemandForecastResponseDTO() {
    }

    public MedicineDemandForecastResponseDTO(MedicineDemandForecast forecast) {
        if (forecast != null) {
            this.id = forecast.getId();
            this.medicineId = forecast.getMedicineId();
            this.phcId = forecast.getPhcId();
            this.forecastDate = forecast.getForecastDate();
            this.predictedDemand = forecast.getPredictedDemand();
            this.currentStock = forecast.getCurrentStock();
            this.recommendedStock = forecast.getRecommendedStock();
            this.riskLevel = forecast.getRiskLevel();
            this.explanation = forecast.getExplanation();
            this.generatedAt = forecast.getGeneratedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getMedicineCode() {
        return medicineCode;
    }

    public void setMedicineCode(String medicineCode) {
        this.medicineCode = medicineCode;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public LocalDate getForecastDate() {
        return forecastDate;
    }

    public void setForecastDate(LocalDate forecastDate) {
        this.forecastDate = forecastDate;
    }

    public Integer getPredictedDemand() {
        return predictedDemand;
    }

    public void setPredictedDemand(Integer predictedDemand) {
        this.predictedDemand = predictedDemand;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Integer getRecommendedStock() {
        return recommendedStock;
    }

    public void setRecommendedStock(Integer recommendedStock) {
        this.recommendedStock = recommendedStock;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
