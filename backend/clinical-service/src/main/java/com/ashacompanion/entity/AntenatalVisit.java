package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "antenatal_visits")
public class AntenatalVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "anc_visit_seq")
    @SequenceGenerator(
        name = "anc_visit_seq",
        sequenceName = "ANTENATAL_VISIT_SEQ",
        allocationSize = 1
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregnancy_id", nullable = false)
    private Pregnancy pregnancy;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column(precision = 4, scale = 2)
    private BigDecimal hemoglobin;

    @Column(name = "fetal_heart_rate")
    private Integer fetalHeartRate;

    @Column(name = "danger_signs", length = 500)
    private String dangerSigns;

    @Column(length = 500)
    private String symptoms;

    @Column(name = "clinical_notes", length = 1000)
    private String clinicalNotes;

    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @Column(name = "high_risk", nullable = false)
    private Integer highRisk = 0;

    @Column(name = "risk_notes", length = 500)
    private String riskNotes;

    @Column(name = "recorded_by_user_id", nullable = false)
    private Long recordedByUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Integer active = 1;

    public AntenatalVisit() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (visitDate == null) {
            visitDate = LocalDate.now();
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

    public Pregnancy getPregnancy() {
        return pregnancy;
    }

    public void setPregnancy(Pregnancy pregnancy) {
        this.pregnancy = pregnancy;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public Integer getSystolicBp() {
        return systolicBp;
    }

    public void setSystolicBp(Integer systolicBp) {
        this.systolicBp = systolicBp;
    }

    public Integer getDiastolicBp() {
        return diastolicBp;
    }

    public void setDiastolicBp(Integer diastolicBp) {
        this.diastolicBp = diastolicBp;
    }

    public BigDecimal getHemoglobin() {
        return hemoglobin;
    }

    public void setHemoglobin(BigDecimal hemoglobin) {
        this.hemoglobin = hemoglobin;
    }

    public Integer getFetalHeartRate() {
        return fetalHeartRate;
    }

    public void setFetalHeartRate(Integer fetalHeartRate) {
        this.fetalHeartRate = fetalHeartRate;
    }

    public String getDangerSigns() {
        return dangerSigns;
    }

    public void setDangerSigns(String dangerSigns) {
        this.dangerSigns = dangerSigns;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public LocalDate getNextVisitDate() {
        return nextVisitDate;
    }

    public void setNextVisitDate(LocalDate nextVisitDate) {
        this.nextVisitDate = nextVisitDate;
    }

    public boolean isHighRisk() {
        return highRisk != null && highRisk == 1;
    }

    public void setHighRisk(boolean highRisk) {
        this.highRisk = highRisk ? 1 : 0;
    }

    public String getRiskNotes() {
        return riskNotes;
    }

    public void setRiskNotes(String riskNotes) {
        this.riskNotes = riskNotes;
    }

    public Long getRecordedByUserId() {
        return recordedByUserId;
    }

    public void setRecordedByUserId(Long recordedByUserId) {
        this.recordedByUserId = recordedByUserId;
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
