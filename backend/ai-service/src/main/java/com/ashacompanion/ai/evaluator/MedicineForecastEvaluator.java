package com.ashacompanion.ai.evaluator;

import com.ashacompanion.ai.dto.MedicineForecastResponseDTO;
import com.ashacompanion.entity.Medicine;
import com.ashacompanion.entity.MedicineTransaction;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MedicineForecastEvaluator {

    public static final String CLINICAL_DISCLAIMER = "This is an AI-assisted advisory forecast and does not replace official pharmacy procurement authorization.";

    public MedicineForecastResponseDTO evaluate(Medicine medicine, String phcId, int currentStock, List<MedicineTransaction> transactions) {
        String code = medicine != null ? medicine.getCode() : "UNKNOWN";
        String name = medicine != null ? medicine.getName() : "Unknown Medication";
        int reorderLevel = (medicine != null && medicine.getReorderLevel() != null) ? medicine.getReorderLevel() : 50;

        // Filter dispensing transactions (type ISSUE or DISPENSE)
        List<MedicineTransaction> dispensingTx = (transactions != null) ? transactions.stream()
            .filter(t -> t.getTransactionType() != null &&
                (t.getTransactionType().equalsIgnoreCase("ISSUE") || t.getTransactionType().equalsIgnoreCase("DISPENSE")))
            .toList() : List.of();

        if (dispensingTx.size() < 3) {
            return new MedicineForecastResponseDTO(
                code,
                name,
                phcId,
                currentStock,
                0,
                30,
                "LOW",
                0,
                "INSUFFICIENT_DATA",
                "Insufficient historical dispensing transactions (minimum 3 required) to compute a reliable 30-day demand forecast.",
                CLINICAL_DISCLAIMER
            );
        }

        // Calculate total quantity dispensed in window
        int totalDispensed = dispensingTx.stream().mapToInt(t -> t.getQuantity() != null ? t.getQuantity() : 0).sum();
        int estimated30DayDemand = Math.max(10, (int) Math.ceil(totalDispensed * 1.2)); // 30-day demand estimate with buffer

        String stockoutRisk;
        int recommendedReorder = 0;

        if (currentStock < (estimated30DayDemand / 2) || currentStock <= reorderLevel) {
            stockoutRisk = "HIGH";
            recommendedReorder = Math.max(100, estimated30DayDemand - currentStock + 50);
        } else if (currentStock < estimated30DayDemand) {
            stockoutRisk = "MEDIUM";
            recommendedReorder = Math.max(50, estimated30DayDemand - currentStock + 20);
        } else {
            stockoutRisk = "LOW";
            recommendedReorder = 0;
        }

        String explanation = "Forecast is based on the weighted average of " + dispensingTx.size() +
            " recent dispensing transactions yielding a 30-day projected demand of " + estimated30DayDemand + " units.";

        return new MedicineForecastResponseDTO(
            code,
            name,
            phcId,
            currentStock,
            estimated30DayDemand,
            30,
            stockoutRisk,
            recommendedReorder,
            "OK",
            explanation,
            CLINICAL_DISCLAIMER
        );
    }
}
