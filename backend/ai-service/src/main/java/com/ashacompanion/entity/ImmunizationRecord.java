package com.ashacompanion.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ImmunizationRecord {

    private Long id;

    private Patient patient;

    private Vaccine vaccine;

    private Integer doseNumber;

    private LocalDate administeredDate;

    private String batchNumber;

    private Long administeredBy;

    private String notes;

    private Integer administered = 0;

    private LocalDate nextDueDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public ImmunizationRecord() {
    }

    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
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

    public Vaccine getVaccine() {
        return vaccine;
    }

    public void setVaccine(Vaccine vaccine) {
        this.vaccine = vaccine;
    }

    public Integer getDoseNumber() {
        return doseNumber;
    }

    public void setDoseNumber(Integer doseNumber) {
        this.doseNumber = doseNumber;
    }

    public LocalDate getAdministeredDate() {
        return administeredDate;
    }

    public void setAdministeredDate(LocalDate administeredDate) {
        this.administeredDate = administeredDate;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public Long getAdministeredBy() {
        return administeredBy;
    }

    public void setAdministeredBy(Long administeredBy) {
        this.administeredBy = administeredBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isAdministered() {
        return administered != null && administered == 1;
    }

    public void setAdministered(boolean administered) {
        this.administered = administered ? 1 : 0;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
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
}
