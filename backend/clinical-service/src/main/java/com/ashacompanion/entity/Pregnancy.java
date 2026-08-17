package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pregnancies")
public class Pregnancy {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pregnancy_seq")
    @SequenceGenerator(
        name = "pregnancy_seq",
        sequenceName = "PREGNANCY_SEQ",
        allocationSize = 1
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "last_menstrual_period")
    private LocalDate lastMenstrualPeriod;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    private Integer gravida;
    private Integer para;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "pregnancy_status", nullable = false)
    private PregnancyStatus pregnancyStatus = PregnancyStatus.REGISTERED;

    @Column(name = "high_risk", nullable = false)
    private Integer highRisk = 0;

    @Column(name = "risk_factors", length = 1000)
    private String riskFactors;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Integer active = 1;

    public Pregnancy() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (registrationDate == null) {
            registrationDate = LocalDate.now();
        }
    }

    @PreUpdate
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
