package com.ashacompanion.ai.evaluator;

import com.ashacompanion.ai.dto.NutritionAIResponseDTO;
import com.ashacompanion.entity.NutritionRecord;
import com.ashacompanion.entity.Patient;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class NutritionAIEvaluator {

    public static final String CLINICAL_DISCLAIMER = "This is an AI-assisted preliminary screening result and does not replace professional clinical assessment.";

    public NutritionAIResponseDTO evaluate(Patient patient, List<NutritionRecord> records) {
        List<String> factors = new ArrayList<>();
        double score = 10.0;
        String trend = "STABLE";

        if (records == null || records.isEmpty()) {
            factors.add("No growth or nutrition measurements recorded yet");
            return new NutritionAIResponseDTO(
                patient.getId(),
                patient.getName(),
                "NORMAL",
                "STABLE",
                10.0,
                factors,
                "Insufficient historical measurements to establish a reliable trend.",
                "Conduct initial anthropometric growth measurement (weight, height, MUAC).",
                CLINICAL_DISCLAIMER
            );
        }

        // Sort records by measurement date descending
        List<NutritionRecord> sorted = new ArrayList<>(records);
        sorted.sort(Comparator.comparing(NutritionRecord::getMeasurementDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        NutritionRecord latest = sorted.get(0);

        // 1. SAM / Risk Flag Check
        if (latest.isRiskFlag()) {
            factors.add("Nutritional risk flag triggered in growth assessment");
            score += 35.0;
        }

        // 2. MUAC Check (< 11.5 cm = SAM, 11.5 - 12.5 cm = MAM)
        if (latest.getMuacCm() != null) {
            if (latest.getMuacCm() < 11.5) {
                factors.add("Critically low MUAC (" + latest.getMuacCm() + " cm)");
                score += 40.0;
            } else if (latest.getMuacCm() < 12.5) {
                factors.add("Low MUAC (" + latest.getMuacCm() + " cm)");
                score += 25.0;
            }
        }

        // 3. Weight-for-Age Status Check
        if (latest.getNutritionStatus() != null) {
            String status = latest.getNutritionStatus().name().toUpperCase();
            if (status.contains("SEVERE") || status.contains("SAM")) {
                factors.add("Severe Acute Malnutrition (SAM) status");
                score += 40.0;
            } else if (status.contains("MODERATE") || status.contains("MAM")) {
                factors.add("Moderate Acute Malnutrition (MAM) status");
                score += 25.0;
            }
        }

        // 4. Longitudinal Trend Calculation (comparing latest with previous record)
        if (sorted.size() >= 2) {
            NutritionRecord previous = sorted.get(1);
            if (latest.getWeightKg() != null && previous.getWeightKg() != null) {
                double weightDiff = latest.getWeightKg() - previous.getWeightKg();
                if (weightDiff < -0.2) {
                    trend = "DECLINING";
                    factors.add("Weight loss detected (" + String.format("%.2f", weightDiff) + " kg since last check)");
                    score += 20.0;
                } else if (weightDiff > 0.2) {
                    trend = "IMPROVING";
                } else {
                    trend = "STABLE";
                }
            }
        } else {
            trend = "STABLE";
            factors.add("Single measurement available; baseline established");
        }

        double finalScore = Math.min(100.0, Math.max(0.0, score));

        String riskLevel;
        String recommendedAction;
        String explanation;

        if (finalScore >= 60.0) {
            riskLevel = "HIGH";
            recommendedAction = "Immediate referral to Nutritional Rehabilitation Centre (NRC) and Medical Officer.";
            explanation = "Child exhibits high-risk malnutrition indicators requiring urgent clinical evaluation.";
        } else if (finalScore >= 35.0) {
            riskLevel = "MODERATE";
            recommendedAction = "Provide supplementary nutrition (THR), counseling, and bi-weekly MUAC checkups.";
            explanation = "Child shows moderate growth faltering or low anthropometric parameters.";
        } else if (finalScore >= 20.0) {
            riskLevel = "AT_RISK";
            recommendedAction = "Provide dietary counseling and monitor weight gain at next VHND session.";
            explanation = "Child has mild risk factors requiring close observation.";
        } else {
            riskLevel = "NORMAL";
            recommendedAction = "Continue age-appropriate complementary feeding and monthly growth monitoring.";
            explanation = "Anthropometric measurements and growth trajectory are normal.";
        }

        if (factors.isEmpty()) {
            factors.add("Anthropometric parameters are within normal growth standards");
        }

        return new NutritionAIResponseDTO(
            patient.getId(),
            patient.getName(),
            riskLevel,
            trend,
            Math.round(finalScore * 10.0) / 10.0,
            factors,
            explanation,
            recommendedAction,
            CLINICAL_DISCLAIMER
        );
    }
}
