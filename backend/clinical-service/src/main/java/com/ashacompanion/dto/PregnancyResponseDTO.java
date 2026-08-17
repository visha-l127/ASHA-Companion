package com.ashacompanion.dto;

import com.ashacompanion.entity.Pregnancy;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PregnancyResponseDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private LocalDate lastMenstrualPeriod;
    private LocalDate expectedDeliveryDate;
    private Integer gravida;
    private Integer para;
    private String bloodGroup;
    private String pregnancyStatus;
    private boolean highRisk;
    private String riskFactors;
    private LocalDate registrationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;

    public PregnancyResponseDTO() {
    }

    public PregnancyResponseDTO(Pregnancy pregnancy) {
        if (pregnancy != null) {
            this.id = pregnancy.getId();
            if (pregnancy.getPatient() != null) {
                this.patientId = pregnancy.getPatient().getId();
                this.patientName = pregnancy.getPatient().getName();
            }
            this.lastMenstrualPeriod = pregnancy.getLastMenstrualPeriod();
            this.expectedDeliveryDate = pregnancy.getExpectedDeliveryDate();
            this.gravida = pregnancy.getGravida();
            this.para = pregnancy.getPara();
            this.bloodGroup = pregnancy.getBloodGroup();
            this.pregnancyStatus = pregnancy.getPregnancyStatus() != null ? pregnancy.getPregnancyStatus().name() : null;
            this.highRisk = pregnancy.isHighRisk();
            this.riskFactors = pregnancy.getRiskFactors();
            this.registrationDate = pregnancy.getRegistrationDate();
            this.createdAt = pregnancy.getCreatedAt();
            this.updatedAt = pregnancy.getUpdatedAt();
            this.active = pregnancy.isActive();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public LocalDate getLastMenstrualPeriod() {
        return lastMenstrualPeriod;
    }

    public void setLastMenstrualPeriod(LocalDate lastMenstrualPeriod) {
        this.lastMenstrualPeriod = lastMenstrualPeriod;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
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

    public boolean isHighRisk() {
        return highRisk;
    }

    public void setHighRisk(boolean highRisk) {
        this.highRisk = highRisk;
    }

    public String getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
