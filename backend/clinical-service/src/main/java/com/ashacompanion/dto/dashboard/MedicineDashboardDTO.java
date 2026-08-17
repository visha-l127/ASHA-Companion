package com.ashacompanion.dto.dashboard;

public class MedicineDashboardDTO {
    private long totalActiveMedicines;
    private long totalStockQuantity;
    private long lowStockMedicineCount;
    private long expiringBatchCount;
    private long expiredBatchCount;
    private long activeBatchCount;

    public MedicineDashboardDTO() {
    }

    public MedicineDashboardDTO(long totalActiveMedicines, long totalStockQuantity, long lowStockMedicineCount, long expiringBatchCount, long expiredBatchCount, long activeBatchCount) {
        this.totalActiveMedicines = totalActiveMedicines;
        this.totalStockQuantity = totalStockQuantity;
        this.lowStockMedicineCount = lowStockMedicineCount;
        this.expiringBatchCount = expiringBatchCount;
        this.expiredBatchCount = expiredBatchCount;
        this.activeBatchCount = activeBatchCount;
    }

    public long getTotalActiveMedicines() {
        return totalActiveMedicines;
    }

    public void setTotalActiveMedicines(long totalActiveMedicines) {
        this.totalActiveMedicines = totalActiveMedicines;
    }

    public long getTotalStockQuantity() {
        return totalStockQuantity;
    }

    public void setTotalStockQuantity(long totalStockQuantity) {
        this.totalStockQuantity = totalStockQuantity;
    }

    public long getLowStockMedicineCount() {
        return lowStockMedicineCount;
    }

    public void setLowStockMedicineCount(long lowStockMedicineCount) {
        this.lowStockMedicineCount = lowStockMedicineCount;
    }

    public long getExpiringBatchCount() {
        return expiringBatchCount;
    }

    public void setExpiringBatchCount(long expiringBatchCount) {
        this.expiringBatchCount = expiringBatchCount;
    }

    public long getExpiredBatchCount() {
        return expiredBatchCount;
    }

    public void setExpiredBatchCount(long expiredBatchCount) {
        this.expiredBatchCount = expiredBatchCount;
    }

    public long getActiveBatchCount() {
        return activeBatchCount;
    }

    public void setActiveBatchCount(long activeBatchCount) {
        this.activeBatchCount = activeBatchCount;
    }
}
