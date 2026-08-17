package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "priority_visits")
public class PriorityVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "priority_visit_seq")
    @SequenceGenerator(
        name = "priority_visit_seq",
        sequenceName = "PRIORITY_VISIT_SEQ",
        allocationSize = 1
    )
    private Long id;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "village")
    private String village;

    @Column(name = "asha_id")
    private String ashaId;

    @Column(name = "asha_name")
    private String ashaName;

    @Column(name = "patient_condition", length = 1000)
    private String condition;

    @Column(name = "urgency")
    private String urgency;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "status")
    private String status = "Pending";

    @Column(name = "notes", length = 1000)
    private String notes;

    public PriorityVisit() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getAshaId() {
        return ashaId;
    }

    public void setAshaId(String ashaId) {
        this.ashaId = ashaId;
    }

    public String getAshaName() {
        return ashaName;
    }

    public void setAshaName(String ashaName) {
        this.ashaName = ashaName;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
