package com.ashacompanion.dto;

public class MedicineDemandForecastRequestDTO {
    private Long medicineId;
    private String phcId;
    private Integer forecastDays;

    public MedicineDemandForecastRequestDTO() {
        this.forecastDays = 30;
    }

    public MedicineDemandForecastRequestDTO(Long medicineId, String phcId, Integer forecastDays) {
        this.medicineId = medicineId;
        this.phcId = phcId;
        this.forecastDays = forecastDays != null ? forecastDays : 30;
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

    public Integer getForecastDays() {
        return forecastDays;
    }

    public void setForecastDays(Integer forecastDays) {
        this.forecastDays = forecastDays;
    }
}
