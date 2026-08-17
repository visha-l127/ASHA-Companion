package com.ashacompanion.dto;

import java.time.LocalDate;

public class ImmunizationSummaryDTO {
    private Long patientId;
    private String patientName;
    private long totalVaccinations;
    private long administeredCount;
    private long pendingCount;
    private long overdueCount;
    private long upcomingCount;
    private LocalDate nextDueDate;

    public ImmunizationSummaryDTO() {
    }

    public ImmunizationSummaryDTO(Long patientId, String patientName, long totalVaccinations,
                                  long administeredCount, long pendingCount, long overdueCount,
                                  long upcomingCount, LocalDate nextDueDate) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.totalVaccinations = totalVaccinations;
        this.administeredCount = administeredCount;
        this.pendingCount = pendingCount;
        this.overdueCount = overdueCount;
        this.upcomingCount = upcomingCount;
        this.nextDueDate = nextDueDate;
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

    public long getTotalVaccinations() {
        return totalVaccinations;
    }

    public void setTotalVaccinations(long totalVaccinations) {
        this.totalVaccinations = totalVaccinations;
    }

    public long getAdministeredCount() {
        return administeredCount;
    }

    public void setAdministeredCount(long administeredCount) {
        this.administeredCount = administeredCount;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(long overdueCount) {
        this.overdueCount = overdueCount;
    }

    public long getUpcomingCount() {
        return upcomingCount;
    }

    public void setUpcomingCount(long upcomingCount) {
        this.upcomingCount = upcomingCount;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }
}
