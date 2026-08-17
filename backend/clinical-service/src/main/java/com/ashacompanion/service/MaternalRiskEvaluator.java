package com.ashacompanion.service;

import com.ashacompanion.entity.AntenatalVisit;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MaternalRiskEvaluator {

    // Clinical thresholds for pregnancy risk evaluation
    public static final int SYSTOLIC_BP_HIGH_THRESHOLD = 140;
    public static final int DIASTOLIC_BP_HIGH_THRESHOLD = 90;
    public static final BigDecimal HEMOGLOBIN_LOW_THRESHOLD = new BigDecimal("11.0");
    public static final int FETAL_HEART_RATE_LOW_THRESHOLD = 110;
    public static final int FETAL_HEART_RATE_HIGH_THRESHOLD = 160;

    public static class RiskAssessment {
        private final boolean highRisk;
        private final String riskFactors;
        private final String riskNotes;

        public RiskAssessment(boolean highRisk, String riskFactors, String riskNotes) {
            this.highRisk = highRisk;
            this.riskFactors = riskFactors;
            this.riskNotes = riskNotes;
        }

        public boolean isHighRisk() {
            return highRisk;
        }

        public String getRiskFactors() {
            return riskFactors;
        }

        public String getRiskNotes() {
            return riskNotes;
        }
    }

    public static RiskAssessment evaluateVisitRisk(AntenatalVisit visit) {
        List<String> factors = new ArrayList<>();
        List<String> notes = new ArrayList<>();

        if (visit.getSystolicBp() != null && visit.getSystolicBp() >= SYSTOLIC_BP_HIGH_THRESHOLD) {
            factors.add("High Systolic Blood Pressure (" + visit.getSystolicBp() + " mmHg)");
            notes.add("Systolic blood pressure is equal to or greater than " + SYSTOLIC_BP_HIGH_THRESHOLD);
        }
        if (visit.getDiastolicBp() != null && visit.getDiastolicBp() >= DIASTOLIC_BP_HIGH_THRESHOLD) {
            factors.add("High Diastolic Blood Pressure (" + visit.getDiastolicBp() + " mmHg)");
            notes.add("Diastolic blood pressure is equal to or greater than " + DIASTOLIC_BP_HIGH_THRESHOLD);
        }
        if (visit.getHemoglobin() != null && visit.getHemoglobin().compareTo(HEMOGLOBIN_LOW_THRESHOLD) < 0) {
            factors.add("Low Hemoglobin (" + visit.getHemoglobin() + " g/dL)");
            notes.add("Hemoglobin level is less than " + HEMOGLOBIN_LOW_THRESHOLD + " g/dL (Anemia)");
        }
        if (visit.getFetalHeartRate() != null) {
            if (visit.getFetalHeartRate() < FETAL_HEART_RATE_LOW_THRESHOLD || visit.getFetalHeartRate() > FETAL_HEART_RATE_HIGH_THRESHOLD) {
                factors.add("Abnormal Fetal Heart Rate (" + visit.getFetalHeartRate() + " bpm)");
                notes.add("Fetal heart rate is outside the normal range (" + FETAL_HEART_RATE_LOW_THRESHOLD + " - " + FETAL_HEART_RATE_HIGH_THRESHOLD + " bpm)");
            }
        }
        if (visit.getDangerSigns() != null && !visit.getDangerSigns().trim().isEmpty()) {
            factors.add("Presence of Danger Signs");
            notes.add("Danger signs reported: " + visit.getDangerSigns());
        }

        boolean highRisk = !factors.isEmpty();
        String riskFactors = String.join(", ", factors);
        String riskNotes = String.join("; ", notes);

        return new RiskAssessment(highRisk, riskFactors, riskNotes);
    }
}
