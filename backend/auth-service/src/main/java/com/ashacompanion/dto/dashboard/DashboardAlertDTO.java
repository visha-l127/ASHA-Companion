package com.ashacompanion.dto.dashboard;

public class DashboardAlertDTO {
    private String type;
    private String severity;
    private Long referenceId;
    private String message;
    private Long patientId;
    private String patientName;
    private String phcId;

    public DashboardAlertDTO() {
    }

    public DashboardAlertDTO(String type, String severity, Long referenceId, String message, Long patientId, String patientName, String phcId) {
        this.type = type;
        this.severity = severity;
        this.referenceId = referenceId;
        this.message = message;
        this.patientId = patientId;
        this.patientName = patientName;
        this.phcId = phcId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }
}
