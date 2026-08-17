package com.ashacompanion.ai.evaluator;

import com.ashacompanion.ai.dto.MedicineExpiryAIResponseDTO;
import com.ashacompanion.entity.Medicine;
import com.ashacompanion.entity.MedicineBatch;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class MedicineExpiryEvaluator {

    public static final String CLINICAL_DISCLAIMER = "This is an AI-assisted advisory risk report and does not automatically alter inventory records.";

    public MedicineExpiryAIResponseDTO evaluate(Medicine medicine, MedicineBatch batch, int estimated30DayDemand) {
        String code = medicine != null ? medicine.getCode() : "UNKNOWN";
        String name = medicine != null ? medicine.getName() : "Unknown Medication";
        Long batchId = batch != null ? batch.getId() : 0L;
        String batchNo = batch != null ? batch.getBatchNumber() : "N/A";
        int currentQty = batch != null ? (batch.getQuantity() != null ? batch.getQuantity() : 0) : 0;
        LocalDate expDate = batch != null ? batch.getExpiryDate() : LocalDate.now().plusMonths(6);

        LocalDate today = LocalDate.now();
        long daysUntilExpiry = expDate != null ? ChronoUnit.DAYS.between(today, expDate) : 180;

        double dailyDispensingRate = estimated30DayDemand > 0 ? (estimated30DayDemand / 30.0) : 1.0;
        int projectedConsumptionBeforeExpiry = (int) Math.round(dailyDispensingRate * Math.max(0, daysUntilExpiry));
        int estimatedUnused = Math.max(0, currentQty - projectedConsumptionBeforeExpiry);

        String expiryRisk;
        String recommendedAction;
        String explanation;

        if (daysUntilExpiry <= 0) {
            expiryRisk = "HIGH";
            estimatedUnused = currentQty;
            explanation = "Batch " + batchNo + " is expired as of " + expDate + ".";
            recommendedAction = "Immediately quarantine batch to prevent dispensing of expired medication.";
        } else if (daysUntilExpiry <= 60 && currentQty > projectedConsumptionBeforeExpiry) {
            expiryRisk = "HIGH";
            explanation = "Batch " + batchNo + " expires in " + daysUntilExpiry + " days. Projected dispensing rate is insufficient to consume " + currentQty + " units.";
            recommendedAction = "Prioritize dispensing via FEFO protocol or request inter-PHC stock transfer to high-demand centers.";
        } else if (daysUntilExpiry <= 90 || estimatedUnused > 0) {
            expiryRisk = "MEDIUM";
            explanation = "Batch " + batchNo + " expires in " + daysUntilExpiry + " days with potential surplus of " + estimatedUnused + " units.";
            recommendedAction = "Monitor weekly dispensing velocity and issue this batch before newer stock.";
        } else {
            expiryRisk = "LOW";
            estimatedUnused = 0;
            explanation = "Batch " + batchNo + " has sufficient shelf life (" + daysUntilExpiry + " days remaining) relative to demand.";
            recommendedAction = "Maintain standard storage and FEFO rotation guidelines.";
        }

        return new MedicineExpiryAIResponseDTO(
            code,
            name,
            batchId,
            batchNo,
            currentQty,
            expDate,
            expiryRisk,
            estimatedUnused,
            explanation,
            recommendedAction,
            CLINICAL_DISCLAIMER
        );
    }
}
