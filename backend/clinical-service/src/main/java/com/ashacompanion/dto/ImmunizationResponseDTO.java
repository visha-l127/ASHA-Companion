package com.ashacompanion.dto;

import com.ashacompanion.entity.ImmunizationRecord;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ImmunizationResponseDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long vaccineId;
    private String vaccineCode;
    private String vaccineName;
    private Integer doseNumber;
    private LocalDate administeredDate;
    private String batchNumber;
    private Long administeredBy;
    private String notes;
    private boolean administered;
    private LocalDate nextDueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ImmunizationResponseDTO() {
    }

    public ImmunizationResponseDTO(ImmunizationRecord record) {
        if (record != null) {
            this.id = record.getId();
            if (record.getPatient() != null) {
                this.patientId = record.getPatient().getId();
                this.patientName = record.getPatient().getName();
            }
            if (record.getVaccine() != null) {
                this.vaccineId = record.getVaccine().getId();
                this.vaccineCode = record.getVaccine().getCode();
                this.vaccineName = record.getVaccine().getName();
            }
            this.doseNumber = record.getDoseNumber();
            this.administeredDate = record.getAdministeredDate();
            this.batchNumber = record.getBatchNumber();
            this.administeredBy = record.getAdministeredBy();
            this.notes = record.getNotes();
            this.administered = record.isAdministered();
            this.nextDueDate = record.getNextDueDate();
            this.createdAt = record.getCreatedAt();
            this.updatedAt = record.getUpdatedAt();
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

    public Long getVaccineId() {
        return vaccineId;
    }

    public void setVaccineId(Long vaccineId) {
        this.vaccineId = vaccineId;
    }

    public String getVaccineCode() {
        return vaccineCode;
    }

    public void setVaccineCode(String vaccineCode) {
        this.vaccineCode = vaccineCode;
    }

    public String getVaccineName() {
        return vaccineName;
    }

    public void setVaccineName(String vaccineName) {
        this.vaccineName = vaccineName;
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
        return administered;
    }

    public void setAdministered(boolean administered) {
        this.administered = administered;
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
