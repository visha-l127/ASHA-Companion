package com.ashacompanion.dto;

import com.ashacompanion.entity.Patient;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientResponseDTO {
    private Long id;
    private String name;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String address;
    private String village;
    private String emergencyContact;
    private String phcId;
    private Long ashaWorkerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;

    public PatientResponseDTO() {
    }

    public PatientResponseDTO(Patient patient) {
        if (patient != null) {
            this.id = patient.getId();
            this.name = patient.getName();
            this.dateOfBirth = patient.getDateOfBirth();
            this.gender = patient.getGender();
            this.phone = patient.getPhone();
            this.address = patient.getAddress();
            this.village = patient.getVillage();
            this.emergencyContact = patient.getEmergencyContact();
            this.phcId = patient.getPhcId();
            this.ashaWorkerId = patient.getAshaWorkerId();
            this.createdAt = patient.getCreatedAt();
            this.updatedAt = patient.getUpdatedAt();
            this.active = patient.isActive();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
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
