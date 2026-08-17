package com.ashacompanion.dto;

public class AlertCountDTO {
    private long total;
    private long high;
    private long medium;
    private long low;

    public AlertCountDTO() {
    }

    public AlertCountDTO(long total, long high, long medium, long low) {
        this.total = total;
        this.high = high;
        this.medium = medium;
        this.low = low;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getHigh() {
        return high;
    }

    public void setHigh(long high) {
        this.high = high;
    }

    public long getMedium() {
        return medium;
    }

    public void setMedium(long medium) {
        this.medium = medium;
    }

    public long getLow() {
        return low;
    }

    public void setLow(long low) {
        this.low = low;
    }
}
