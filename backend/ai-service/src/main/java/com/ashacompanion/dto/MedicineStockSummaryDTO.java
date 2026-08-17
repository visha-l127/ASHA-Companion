package com.ashacompanion.dto;

public class MedicineStockSummaryDTO {
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Integer totalQuantity;
    private Integer reorderLevel;
    private boolean lowStock;
    private Integer expiredQuantity;
    private Integer expiringSoonQuantity;

    public MedicineStockSummaryDTO() {
    }

    public MedicineStockSummaryDTO(Long medicineId, String medicineName, String medicineCode,
                                  Integer totalQuantity, Integer reorderLevel, boolean lowStock,
                                  Integer expiredQuantity, Integer expiringSoonQuantity) {
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.medicineCode = medicineCode;
        this.totalQuantity = totalQuantity;
        this.reorderLevel = reorderLevel;
        this.lowStock = lowStock;
        this.expiredQuantity = expiredQuantity;
        this.expiringSoonQuantity = expiringSoonQuantity;
    }

    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getMedicineCode() {
        return medicineCode;
    }

    public void setMedicineCode(String medicineCode) {
        this.medicineCode = medicineCode;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public boolean isLowStock() {
        return lowStock;
    }

    public void setLowStock(boolean lowStock) {
        this.lowStock = lowStock;
    }

    public Integer getExpiredQuantity() {
        return expiredQuantity;
    }

    public void setExpiredQuantity(Integer expiredQuantity) {
        this.expiredQuantity = expiredQuantity;
    }

    public Integer getExpiringSoonQuantity() {
        return expiringSoonQuantity;
    }

    public void setExpiringSoonQuantity(Integer expiringSoonQuantity) {
        this.expiringSoonQuantity = expiringSoonQuantity;
    }
}
