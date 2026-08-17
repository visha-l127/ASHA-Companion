package com.ashacompanion.dto.dashboard;

public class PatientDashboardDTO {
    private long totalPatients;
    private long activePatients;
    private long inactivePatients;

    public PatientDashboardDTO() {
    }

    public PatientDashboardDTO(long totalPatients, long activePatients, long inactivePatients) {
        this.totalPatients = totalPatients;
        this.activePatients = activePatients;
        this.inactivePatients = inactivePatients;
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

    public long getInactivePatients() {
        return inactivePatients;
    }

    public void setInactivePatients(long inactivePatients) {
        this.inactivePatients = inactivePatients;
    }
}
