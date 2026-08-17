package com.ashacompanion.dto;

public class AlertSummaryDTO {
    private long totalAlerts;
    private long unacknowledgedAlerts;
    private long highSeverityAlerts;
    private long mediumSeverityAlerts;
    private long lowSeverityAlerts;

    public AlertSummaryDTO() {
    }

    public AlertSummaryDTO(long totalAlerts, long unacknowledgedAlerts, long highSeverityAlerts, long mediumSeverityAlerts, long lowSeverityAlerts) {
        this.totalAlerts = totalAlerts;
        this.unacknowledgedAlerts = unacknowledgedAlerts;
        this.highSeverityAlerts = highSeverityAlerts;
        this.mediumSeverityAlerts = mediumSeverityAlerts;
        this.lowSeverityAlerts = lowSeverityAlerts;
    }

    public long getTotalAlerts() {
        return totalAlerts;
    }

    public void setTotalAlerts(long totalAlerts) {
        this.totalAlerts = totalAlerts;
    }

    public long getUnacknowledgedAlerts() {
        return unacknowledgedAlerts;
    }

    public void setUnacknowledgedAlerts(long unacknowledgedAlerts) {
        this.unacknowledgedAlerts = unacknowledgedAlerts;
    }

    public long getHighSeverityAlerts() {
        return highSeverityAlerts;
    }

    public void setHighSeverityAlerts(long highSeverityAlerts) {
        this.highSeverityAlerts = highSeverityAlerts;
    }

    public long getMediumSeverityAlerts() {
        return mediumSeverityAlerts;
    }

    public void setMediumSeverityAlerts(long mediumSeverityAlerts) {
        this.mediumSeverityAlerts = mediumSeverityAlerts;
    }

    public long getLowSeverityAlerts() {
        return lowSeverityAlerts;
    }

    public void setLowSeverityAlerts(long lowSeverityAlerts) {
        this.lowSeverityAlerts = lowSeverityAlerts;
    }
}
