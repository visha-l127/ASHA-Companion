package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEDICINE_DEMAND_FORECASTS", indexes = {
    @Index(name = "idx_fc_med", columnList = "medicineId"),
    @Index(name = "idx_fc_phc", columnList = "phcId"),
    @Index(name = "idx_fc_date", columnList = "forecastDate")
})
public class MedicineDemandForecast {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "med_forecast_seq")
    @SequenceGenerator(name = "med_forecast_seq", sequenceName = "MEDICINE_FORECAST_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private Long medicineId;

    private String phcId;

    @Column(nullable = false)
    private LocalDate forecastDate;

    @Column(nullable = false)
    private Integer predictedDemand;

    @Column(nullable = false)
    private Integer currentStock;

    @Column(nullable = false)
    private Integer recommendedStock;

    @Column(nullable = false, length = 20)
    private String riskLevel;

    @Lob
    @Column(length = 4000)
    private String explanation;

    private LocalDateTime generatedAt;

    public MedicineDemandForecast() {
        this.generatedAt = LocalDateTime.now();
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
