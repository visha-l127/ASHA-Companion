package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "EHR_RECORDS")
public class EhrRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ehr_record_seq")
    @SequenceGenerator(name = "ehr_record_seq", sequenceName = "EHR_RECORD_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "record_id", unique = true, nullable = false, length = 50)
    private String recordId;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "patient_gender", length = 10)
    private String patientGender;

    private String village;

    @Column(length = 20)
    private String status = "synced";

    @Column(name = "last_updated")
    private String lastUpdated;

    @Column(length = 1000)
    private String diagnosis;

    @Column(length = 1000)
    private String treatment;

    @Column(name = "worker_id")
    private String workerId;

    @Column(name = "record_type", length = 50)
    private String type;

    @Column(name = "phc_facility")
    private String phcFacility;

    @Column(name = "asha_name")
    private String ashaName;

    @Column(name = "phc_id")
    private String phcId;

    @Column(name = "verification_status", length = 30)
    private String verificationStatus = "pending";

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verified_at")
    private String verifiedAt;

    @Column(name = "correction_note", length = 1000)
    private String correctionNote;

    public EhrRecord() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecordId() {
        return recordId;
    }

    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Integer getPatientAge() {
        return patientAge;
    }

    public void setPatientAge(Integer patientAge) {
        this.patientAge = patientAge;
    }

    public String getPatientGender() {
        return patientGender;
    }

    public void setPatientGender(String patientGender) {
        this.patientGender = patientGender;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getWorkerId() {
        return workerId;
    }

    public void setWorkerId(String workerId) {
        this.workerId = workerId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPhcFacility() {
        return phcFacility;
    }

    public void setPhcFacility(String phcFacility) {
        this.phcFacility = phcFacility;
    }

    public String getAshaName() {
        return ashaName;
    }

    public void setAshaName(String ashaName) {
        this.ashaName = ashaName;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public String getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(String verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getCorrectionNote() {
        return correctionNote;
    }

    public void setCorrectionNote(String correctionNote) {
        this.correctionNote = correctionNote;
    }
}
