package com.ashacompanion.dto.dashboard;

import java.util.List;

public class AshaWorkerDashboardDTO {
    private long totalAshaWorkers;
    private List<AshaWorkerSummaryDTO> workers;

    public AshaWorkerDashboardDTO() {
    }

    public AshaWorkerDashboardDTO(long totalAshaWorkers, List<AshaWorkerSummaryDTO> workers) {
        this.totalAshaWorkers = totalAshaWorkers;
        this.workers = workers;
    }

    public long getTotalAshaWorkers() {
        return totalAshaWorkers;
    }

    public void setTotalAshaWorkers(long totalAshaWorkers) {
        this.totalAshaWorkers = totalAshaWorkers;
    }

    public List<AshaWorkerSummaryDTO> getWorkers() {
        return workers;
    }

    public void setWorkers(List<AshaWorkerSummaryDTO> workers) {
        this.workers = workers;
    }
}
