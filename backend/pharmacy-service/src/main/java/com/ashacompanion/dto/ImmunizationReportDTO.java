package com.ashacompanion.dto;

import java.util.Map;

public class ImmunizationReportDTO {
    private long totalImmunizationRecords;
    private long administeredRecords;
    private long upcomingVaccinationsCount;
    private long overdueVaccinationsCount;
    private Map<String, Long> vaccineWiseCounts;

    public ImmunizationReportDTO() {
    }

    public long getTotalImmunizationRecords() {
        return totalImmunizationRecords;
    }

    public void setTotalImmunizationRecords(long totalImmunizationRecords) {
        this.totalImmunizationRecords = totalImmunizationRecords;
    }

    public long getAdministeredRecords() {
        return administeredRecords;
    }

    public void setAdministeredRecords(long administeredRecords) {
        this.administeredRecords = administeredRecords;
    }

    public long getUpcomingVaccinationsCount() {
        return upcomingVaccinationsCount;
    }

    public void setUpcomingVaccinationsCount(long upcomingVaccinationsCount) {
        this.upcomingVaccinationsCount = upcomingVaccinationsCount;
    }

    public long getOverdueVaccinationsCount() {
        return overdueVaccinationsCount;
    }

    public void setOverdueVaccinationsCount(long overdueVaccinationsCount) {
        this.overdueVaccinationsCount = overdueVaccinationsCount;
    }

    public Map<String, Long> getVaccineWiseCounts() {
        return vaccineWiseCounts;
    }

    public void setVaccineWiseCounts(Map<String, Long> vaccineWiseCounts) {
        this.vaccineWiseCounts = vaccineWiseCounts;
    }
}
