package com.ashacompanion.ai.evaluator;

import com.ashacompanion.ai.dto.MaternalAIResponseDTO;
import com.ashacompanion.entity.AntenatalVisit;
import com.ashacompanion.entity.Patient;
import com.ashacompanion.entity.Pregnancy;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Component
public class MaternalAIEvaluator {

    public static final String CLINICAL_DISCLAIMER = "This is an AI-assisted preliminary screening result and does not replace professional clinical assessment.";

    public MaternalAIResponseDTO evaluate(Pregnancy pregnancy, Patient patient, List<AntenatalVisit> visits) {
        List<String> factors = new ArrayList<>();
        double score = 10.0; // Base baseline score

        // 1. Maternal Age check
        if (patient != null && patient.getDateOfBirth() != null) {
            int age = Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
            if (age < 18) {
                factors.add("Maternal age under 18 years (" + age + " years)");
                score += 25.0;
            } else if (age > 35) {
                factors.add("Advanced maternal age (" + age + " years)");
                score += 20.0;
            }
        }

        // 2. Pregnancy High-Risk Factors
        if (pregnancy.isHighRisk()) {
            factors.add("Flagged as high-risk pregnancy in clinical registry");
            score += 30.0;
        }

        if (pregnancy.getRiskFactors() != null && !pregnancy.getRiskFactors().isBlank()) {
            factors.add("Documented risk factors: " + pregnancy.getRiskFactors());
            score += 15.0;
        }

        // 3. Gravida / Para check
        if (pregnancy.getGravida() != null && pregnancy.getGravida() >= 5) {
            factors.add("Grand multiparity (Gravida " + pregnancy.getGravida() + ")");
            score += 15.0;
        }

        // 4. Latest Antenatal Visit Clinical Measurements
        if (visits != null && !visits.isEmpty()) {
            AntenatalVisit latest = visits.get(0);

            // Blood Pressure Thresholds (Systolic >= 140 OR Diastolic >= 90)
            if (latest.getSystolicBp() != null && latest.getDiastolicBp() != null) {
                if (latest.getSystolicBp() >= 140 || latest.getDiastolicBp() >= 90) {
                    factors.add("Elevated blood pressure (" + latest.getSystolicBp() + "/" + latest.getDiastolicBp() + " mmHg)");
                    score += 30.0;
                }
            }

            // Hemoglobin Threshold (< 11.0 g/dL)
            if (latest.getHemoglobin() != null) {
                double hb = latest.getHemoglobin().doubleValue();
                if (hb < 7.0) {
                    factors.add("Severe anemia (Hb " + hb + " g/dL)");
                    score += 35.0;
                } else if (hb < 11.0) {
                    factors.add("Anemia detected (Hb " + hb + " g/dL)");
                    score += 20.0;
                }
            }

            // Fetal Heart Rate Threshold (< 110 bpm OR > 160 bpm)
            if (latest.getFetalHeartRate() != null) {
                if (latest.getFetalHeartRate() < 110 || latest.getFetalHeartRate() > 160) {
                    factors.add("Abnormal fetal heart rate (" + latest.getFetalHeartRate() + " bpm)");
                    score += 25.0;
                }
            }

            // Danger Signs
            if (latest.getDangerSigns() != null && !latest.getDangerSigns().isBlank()) {
                factors.add("Observed danger signs: " + latest.getDangerSigns());
                score += 30.0;
            }
        } else {
            factors.add("No recorded ANC visits in current trimester");
            score += 15.0;
        }

        // Normalize score 0 to 100
        double finalScore = Math.min(100.0, Math.max(0.0, score));

        String riskLevel;
        String recommendedAction;
        String explanation;

        if (finalScore >= 60.0) {
            riskLevel = "HIGH";
            recommendedAction = "Immediate referral to PHC Medical Officer and urgent supervisor review required.";
            explanation = "Multiple high-risk clinical indicators were detected in maternal measurements and history.";
        } else if (finalScore >= 35.0) {
            riskLevel = "MODERATE";
            recommendedAction = "Schedule follow-up ANC visit within 7 days and monitor blood pressure and hemoglobin closely.";
            explanation = "Moderate clinical risk factors identified requiring increased monitoring frequency.";
        } else {
            riskLevel = "LOW";
            recommendedAction = "Continue routine ANC checkups and standard iron-folic acid supplementation.";
            explanation = "Maternal clinical parameters are within normal screening thresholds.";
        }

        if (factors.isEmpty()) {
            factors.add("All recorded clinical parameters are within normal limits");
        }

        double confidence = 0.90;

        Long patId = patient != null ? patient.getId() : (pregnancy.getPatient() != null ? pregnancy.getPatient().getId() : 0L);

        return new MaternalAIResponseDTO(
            pregnancy.getId(),
            patId,
            patient != null ? patient.getName() : "Unknown Patient",
            riskLevel,
            Math.round(finalScore * 10.0) / 10.0,
            confidence,
            factors,
            explanation,
            recommendedAction,
            CLINICAL_DISCLAIMER
        );
    }
}
