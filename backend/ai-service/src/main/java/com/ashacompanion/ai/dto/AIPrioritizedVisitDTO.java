package com.ashacompanion.ai.dto;

import java.time.LocalDate;
import java.util.List;

public class AIPrioritizedVisitDTO {
    private Long patientId;
    private String patientName;
    private String village;
    private int priorityScore;
    private String priorityLevel; // CRITICAL, HIGH, MEDIUM, LOW
    private List<String> reasons;
    private String condition;
    private String notes;
    private LocalDate assignedDate;
    private String status;

    public AIPrioritizedVisitDTO() {}

    public AIPrioritizedVisitDTO(Long patientId, String patientName, String village, int priorityScore, 
                                 String priorityLevel, List<String> reasons, String condition, 
                                 String notes, LocalDate assignedDate, String status) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.village = village;
        this.priorityScore = priorityScore;
        this.priorityLevel = priorityLevel;
        this.reasons = reasons;
        this.condition = condition;
        this.notes = notes;
        this.assignedDate = assignedDate;
        this.status = status;
    }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public int getPriorityScore() { return priorityScore; }
    public void setPriorityScore(int priorityScore) { this.priorityScore = priorityScore; }

    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
