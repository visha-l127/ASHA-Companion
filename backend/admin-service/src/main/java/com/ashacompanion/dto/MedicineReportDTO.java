package com.ashacompanion.dto;

public class MedicineReportDTO {
    private long totalMedicines;
    private long activeMedicines;
    private long totalBatches;
    private long lowStockCount;
    private long expiredBatchesCount;
    private long expiringSoonBatchesCount;
    private long totalAvailableQuantity;

    public MedicineReportDTO() {
    }

    public long getTotalMedicines() {
        return totalMedicines;
    }

    public void setTotalMedicines(long totalMedicines) {
        this.totalMedicines = totalMedicines;
    }

    public long getActiveMedicines() {
        return activeMedicines;
    }

    public void setActiveMedicines(long activeMedicines) {
        this.activeMedicines = activeMedicines;
    }

    public long getTotalBatches() {
        return totalBatches;
    }

    public void setTotalBatches(long totalBatches) {
        this.totalBatches = totalBatches;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getExpiredBatchesCount() {
        return expiredBatchesCount;
    }

    public void setExpiredBatchesCount(long expiredBatchesCount) {
        this.expiredBatchesCount = expiredBatchesCount;
    }

    public long getExpiringSoonBatchesCount() {
        return expiringSoonBatchesCount;
    }

    public void setExpiringSoonBatchesCount(long expiringSoonBatchesCount) {
        this.expiringSoonBatchesCount = expiringSoonBatchesCount;
    }

    public long getTotalAvailableQuantity() {
        return totalAvailableQuantity;
    }

    public void setTotalAvailableQuantity(long totalAvailableQuantity) {
        this.totalAvailableQuantity = totalAvailableQuantity;
    }
}
