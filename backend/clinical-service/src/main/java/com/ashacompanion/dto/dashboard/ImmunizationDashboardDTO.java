package com.ashacompanion.dto.dashboard;

public class ImmunizationDashboardDTO {
    private long totalImmunizationRecords;
    private long upcomingVaccinations;
    private long overdueVaccinations;
    private long administeredVaccinations;

    public ImmunizationDashboardDTO() {
    }

    public ImmunizationDashboardDTO(long totalImmunizationRecords, long upcomingVaccinations, long overdueVaccinations, long administeredVaccinations) {
        this.totalImmunizationRecords = totalImmunizationRecords;
        this.upcomingVaccinations = upcomingVaccinations;
        this.overdueVaccinations = overdueVaccinations;
        this.administeredVaccinations = administeredVaccinations;
    }

    public long getTotalImmunizationRecords() {
        return totalImmunizationRecords;
    }

    public void setTotalImmunizationRecords(long totalImmunizationRecords) {
        this.totalImmunizationRecords = totalImmunizationRecords;
    }

    public long getUpcomingVaccinations() {
        return upcomingVaccinations;
    }

    public void setUpcomingVaccinations(long upcomingVaccinations) {
        this.upcomingVaccinations = upcomingVaccinations;
    }

    public long getOverdueVaccinations() {
        return overdueVaccinations;
    }

    public void setOverdueVaccinations(long overdueVaccinations) {
        this.overdueVaccinations = overdueVaccinations;
    }

    public long getAdministeredVaccinations() {
        return administeredVaccinations;
    }

    public void setAdministeredVaccinations(long administeredVaccinations) {
        this.administeredVaccinations = administeredVaccinations;
    }
}
