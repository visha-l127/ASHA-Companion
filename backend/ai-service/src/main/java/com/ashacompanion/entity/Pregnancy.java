package com.ashacompanion.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Pregnancy {

    private Long id;

    private Patient patient;

    private LocalDate lastMenstrualPeriod;

    private LocalDate expectedDeliveryDate;

    private Integer gravida;
    private Integer para;

    private String bloodGroup;

    private PregnancyStatus pregnancyStatus = PregnancyStatus.REGISTERED;

    private Integer highRisk = 0;

    private String riskFactors;

    private LocalDate registrationDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer active = 1;

    public Pregnancy() {
    }

    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (registrationDate == null) {
            registrationDate = LocalDate.now();
        }
    }

    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
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

    public PregnancyStatus getPregnancyStatus() {
        return pregnancyStatus;
    }

    public void setPregnancyStatus(PregnancyStatus pregnancyStatus) {
        this.pregnancyStatus = pregnancyStatus;
    }

    public boolean isHighRisk() {
        return highRisk != null && highRisk == 1;
    }

    public void setHighRisk(boolean highRisk) {
        this.highRisk = highRisk ? 1 : 0;
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
        return active != null && active == 1;
    }

    public void setActive(boolean active) {
        this.active = active ? 1 : 0;
    }
}
