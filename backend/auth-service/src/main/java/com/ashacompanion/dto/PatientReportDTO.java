package com.ashacompanion.dto;

public class PatientReportDTO {
    private long totalPatients;
    private long activePatients;
    private long malePatients;
    private long femalePatients;
    private long otherGenderPatients;
    private String phcId;
    private long assignedAshaPatientCount;

    public PatientReportDTO() {
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getActivePatients() {
        return activePatients;
    }

    public void setActivePatients(long activePatients) {
        this.activePatients = activePatients;
    }

    public long getMalePatients() {
        return malePatients;
    }

    public void setMalePatients(long malePatients) {
        this.malePatients = malePatients;
    }

    public long getFemalePatients() {
        return femalePatients;
    }

    public void setFemalePatients(long femalePatients) {
        this.femalePatients = femalePatients;
    }

    public long getOtherGenderPatients() {
        return otherGenderPatients;
    }

    public void setOtherGenderPatients(long otherGenderPatients) {
        this.otherGenderPatients = otherGenderPatients;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public long getAssignedAshaPatientCount() {
        return assignedAshaPatientCount;
    }

    public void setAssignedAshaPatientCount(long assignedAshaPatientCount) {
        this.assignedAshaPatientCount = assignedAshaPatientCount;
    }
}
