package com.ashacompanion.dto.dashboard;

import java.time.LocalDate;

public class MedicineExpiryAIResponseDTO {
    private String medicineCode;
    private String medicineName;
    private Long batchId;
    private String batchNumber;
    private Integer currentQuantity;
    private LocalDate expiryDate;
    private String expiryRisk; // LOW, MEDIUM, HIGH
    private Integer estimatedUnusedQuantity;
    private String explanation;
    private String recommendedAction;
    private String disclaimer;

    public MedicineExpiryAIResponseDTO() {
    }

    public MedicineExpiryAIResponseDTO(String medicineCode, String medicineName, Long batchId, String batchNumber, Integer currentQuantity, LocalDate expiryDate, String expiryRisk, Integer estimatedUnusedQuantity, String explanation, String recommendedAction, String disclaimer) {
        this.medicineCode = medicineCode;
        this.medicineName = medicineName;
        this.batchId = batchId;
        this.batchNumber = batchNumber;
        this.currentQuantity = currentQuantity;
        this.expiryDate = expiryDate;
        this.expiryRisk = expiryRisk;
        this.estimatedUnusedQuantity = estimatedUnusedQuantity;
        this.explanation = explanation;
        this.recommendedAction = recommendedAction;
        this.disclaimer = disclaimer;
    }

    public String getMedicineCode() {
        return medicineCode;
    }

    public void setMedicineCode(String medicineCode) {
        this.medicineCode = medicineCode;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public Integer getCurrentQuantity() {
        return currentQuantity;
    }

    public void setCurrentQuantity(Integer currentQuantity) {
        this.currentQuantity = currentQuantity;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getExpiryRisk() {
        return expiryRisk;
    }

    public void setExpiryRisk(String expiryRisk) {
        this.expiryRisk = expiryRisk;
    }

    public Integer getEstimatedUnusedQuantity() {
        return estimatedUnusedQuantity;
    }

    public void setEstimatedUnusedQuantity(Integer estimatedUnusedQuantity) {
        this.estimatedUnusedQuantity = estimatedUnusedQuantity;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
