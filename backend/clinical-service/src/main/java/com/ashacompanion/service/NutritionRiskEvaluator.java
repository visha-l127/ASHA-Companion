package com.ashacompanion.service;

import com.ashacompanion.entity.NutritionStatus;
import java.util.ArrayList;
import java.util.List;

public class NutritionRiskEvaluator {

    // Clinical screening thresholds for child growth (preliminary screening only, not diagnostics)
    public static final double MUAC_SAM_THRESHOLD = 11.5;
    public static final double MUAC_MAM_THRESHOLD = 12.5;
    public static final double MUAC_AT_RISK_THRESHOLD = 13.5;

    public static final double BMI_SEVERE_WASTING_THRESHOLD = 11.0;
    public static final double BMI_MODERATE_WASTING_THRESHOLD = 13.0;
    public static final double BMI_OVERWEIGHT_THRESHOLD = 22.0;

    public static class EvaluationResult {
        private final NutritionStatus status;
        private final boolean riskFlag;
        private final String riskFactors;

        public EvaluationResult(NutritionStatus status, boolean riskFlag, String riskFactors) {
            this.status = status;
            this.riskFlag = riskFlag;
            this.riskFactors = riskFactors;
        }

        public NutritionStatus getStatus() {
            return status;
        }

        public boolean isRiskFlag() {
            return riskFlag;
        }

        public String getRiskFactors() {
            return riskFactors;
        }
    }

    public static EvaluationResult evaluate(Double weightKg, Double heightCm, Double muacCm) {
        List<String> factors = new ArrayList<>();
        NutritionStatus finalStatus = NutritionStatus.NORMAL;

        // 1. MUAC Screening (Mid-Upper Arm Circumference)
        if (muacCm != null) {
            if (muacCm < MUAC_SAM_THRESHOLD) {
                finalStatus = maxStatus(finalStatus, NutritionStatus.HIGH_RISK);
                factors.add("Severe Acute Malnutrition (MUAC < " + MUAC_SAM_THRESHOLD + " cm)");
            } else if (muacCm >= MUAC_SAM_THRESHOLD && muacCm < MUAC_MAM_THRESHOLD) {
                finalStatus = maxStatus(finalStatus, NutritionStatus.MODERATE_RISK);
                factors.add("Moderate Acute Malnutrition (MUAC " + MUAC_SAM_THRESHOLD + " - " + MUAC_MAM_THRESHOLD + " cm)");
            } else if (muacCm >= MUAC_MAM_THRESHOLD && muacCm < MUAC_AT_RISK_THRESHOLD) {
                finalStatus = maxStatus(finalStatus, NutritionStatus.AT_RISK);
                factors.add("At Risk of Malnutrition (MUAC " + MUAC_MAM_THRESHOLD + " - " + MUAC_AT_RISK_THRESHOLD + " cm)");
            }
        }

        // 2. BMI-for-Age Proxy (Weight-for-Height)
        if (heightCm != null && heightCm > 0 && weightKg != null && weightKg > 0) {
            double heightM = heightCm / 100.0;
            double bmi = weightKg / (heightM * heightM);

            if (bmi < BMI_SEVERE_WASTING_THRESHOLD) {
                finalStatus = maxStatus(finalStatus, NutritionStatus.HIGH_RISK);
                factors.add("Severe wasting (BMI proxy < " + BMI_SEVERE_WASTING_THRESHOLD + ")");
            } else if (bmi >= BMI_SEVERE_WASTING_THRESHOLD && bmi < BMI_MODERATE_WASTING_THRESHOLD) {
                finalStatus = maxStatus(finalStatus, NutritionStatus.MODERATE_RISK);
                factors.add("Moderate wasting (BMI proxy " + BMI_SEVERE_WASTING_THRESHOLD + " - " + BMI_MODERATE_WASTING_THRESHOLD + ")");
            } else if (bmi > BMI_OVERWEIGHT_THRESHOLD) {
                finalStatus = maxStatus(finalStatus, NutritionStatus.AT_RISK);
                factors.add("High weight-for-height proxy (> " + BMI_OVERWEIGHT_THRESHOLD + ")");
            }
        }

        boolean riskFlag = finalStatus != NutritionStatus.NORMAL;
        String riskFactorsStr = factors.isEmpty() ? "None" : String.join(", ", factors);

        return new EvaluationResult(finalStatus, riskFlag, riskFactorsStr);
    }

    private static NutritionStatus maxStatus(NutritionStatus s1, NutritionStatus s2) {
        if (s1 == NutritionStatus.HIGH_RISK || s2 == NutritionStatus.HIGH_RISK) {
            return NutritionStatus.HIGH_RISK;
        }
        if (s1 == NutritionStatus.MODERATE_RISK || s2 == NutritionStatus.MODERATE_RISK) {
            return NutritionStatus.MODERATE_RISK;
        }
        if (s1 == NutritionStatus.AT_RISK || s2 == NutritionStatus.AT_RISK) {
            return NutritionStatus.AT_RISK;
        }
        return NutritionStatus.NORMAL;
    }
}
