package com.ashacompanion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class PregnancyRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Last Menstrual Period (LMP) is required")
    @jakarta.validation.constraints.PastOrPresent(message = "Last Menstrual Period cannot be in the future")
    private LocalDate lastMenstrualPeriod;

    @NotNull(message = "Gravida count is required")
    @Positive(message = "Gravida must be a positive integer")
    private Integer gravida;

    @NotNull(message = "Para count is required")
    @Min(value = 0, message = "Para must be 0 or greater")
    private Integer para;

    private String bloodGroup;
    private String pregnancyStatus;

    public PregnancyRequestDTO() {
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public LocalDate getLastMenstrualPeriod() {
        return lastMenstrualPeriod;
    }

    public void setLastMenstrualPeriod(LocalDate lastMenstrualPeriod) {
        this.lastMenstrualPeriod = lastMenstrualPeriod;
    }

    public Integer getGravida() {
        return gravida;
    }

    public void setGravida(Integer gravida) {
        this.gravida = gravida;
    }

    public Integer getPara() {
        return para;
    }

    public void setPara(Integer para) {
        this.para = para;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getPregnancyStatus() {
        return pregnancyStatus;
    }

    public void setPregnancyStatus(String pregnancyStatus) {
        this.pregnancyStatus = pregnancyStatus;
    }
}
