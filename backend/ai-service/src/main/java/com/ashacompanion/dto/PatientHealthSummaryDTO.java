package com.ashacompanion.dto;

import java.time.LocalDate;

public class PatientHealthSummaryDTO {
    // Patient Details
    private Long patientId;
    private String patientName;
    private String gender;
    private LocalDate dateOfBirth;
    private String phcId;
    private Long ashaWorkerId;

    // Pregnancy Summary
    private boolean hasActivePregnancy;
    private String pregnancyStatus;
    private LocalDate expectedDeliveryDate;
    private boolean highRiskPregnancy;
    private String pregnancyRiskFactors;

    // ANC Summary
    private int totalANCVisits;
    private LocalDate lastANCVisitDate;
    private LocalDate nextANCVisitDate;
    private boolean overdueANC;

    // Immunization Summary
    private int totalImmunizations;
    private int upcomingImmunizations;
    private int overdueImmunizations;

    // Nutrition Summary
    private String latestNutritionStatus;
    private LocalDate latestNutritionDate;
    private boolean nutritionRisk;
    private String nutritionRiskFactors;

    public PatientHealthSummaryDTO() {
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public Long getAshaWorkerId() {
        return ashaWorkerId;
    }

    public void setAshaWorkerId(Long ashaWorkerId) {
        this.ashaWorkerId = ashaWorkerId;
    }

    public boolean isHasActivePregnancy() {
        return hasActivePregnancy;
    }

    public void setHasActivePregnancy(boolean hasActivePregnancy) {
        this.hasActivePregnancy = hasActivePregnancy;
    }

    public String getPregnancyStatus() {
        return pregnancyStatus;
    }

    public void setPregnancyStatus(String pregnancyStatus) {
        this.pregnancyStatus = pregnancyStatus;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public boolean isHighRiskPregnancy() {
        return highRiskPregnancy;
    }

    public void setHighRiskPregnancy(boolean highRiskPregnancy) {
        this.highRiskPregnancy = highRiskPregnancy;
    }

    public String getPregnancyRiskFactors() {
        return pregnancyRiskFactors;
    }

    public void setPregnancyRiskFactors(String pregnancyRiskFactors) {
        this.pregnancyRiskFactors = pregnancyRiskFactors;
    }

    public int getTotalANCVisits() {
        return totalANCVisits;
    }

    public void setTotalANCVisits(int totalANCVisits) {
        this.totalANCVisits = totalANCVisits;
    }

    public LocalDate getLastANCVisitDate() {
        return lastANCVisitDate;
    }

    public void setLastANCVisitDate(LocalDate lastANCVisitDate) {
        this.lastANCVisitDate = lastANCVisitDate;
    }

    public LocalDate getNextANCVisitDate() {
        return nextANCVisitDate;
    }

    public void setNextANCVisitDate(LocalDate nextANCVisitDate) {
        this.nextANCVisitDate = nextANCVisitDate;
    }

    public boolean isOverdueANC() {
        return overdueANC;
    }

    public void setOverdueANC(boolean overdueANC) {
        this.overdueANC = overdueANC;
    }

    public int getTotalImmunizations() {
        return totalImmunizations;
    }

    public void setTotalImmunizations(int totalImmunizations) {
        this.totalImmunizations = totalImmunizations;
    }

    public int getUpcomingImmunizations() {
        return upcomingImmunizations;
    }

    public void setUpcomingImmunizations(int upcomingImmunizations) {
        this.upcomingImmunizations = upcomingImmunizations;
    }

    public int getOverdueImmunizations() {
        return overdueImmunizations;
    }

    public void setOverdueImmunizations(int overdueImmunizations) {
        this.overdueImmunizations = overdueImmunizations;
    }

    public String getLatestNutritionStatus() {
        return latestNutritionStatus;
    }

    public void setLatestNutritionStatus(String latestNutritionStatus) {
        this.latestNutritionStatus = latestNutritionStatus;
    }

    public LocalDate getLatestNutritionDate() {
        return latestNutritionDate;
    }

    public void setLatestNutritionDate(LocalDate latestNutritionDate) {
        this.latestNutritionDate = latestNutritionDate;
    }

    public boolean isNutritionRisk() {
        return nutritionRisk;
    }

    public void setNutritionRisk(boolean nutritionRisk) {
        this.nutritionRisk = nutritionRisk;
    }

    public String getNutritionRiskFactors() {
        return nutritionRiskFactors;
    }

    public void setNutritionRiskFactors(String nutritionRiskFactors) {
        this.nutritionRiskFactors = nutritionRiskFactors;
    }
}
