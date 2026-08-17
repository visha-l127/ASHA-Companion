package com.ashacompanion.ai.evaluator;

import com.ashacompanion.ai.dto.ImmunizationAIResponseDTO;
import com.ashacompanion.entity.ImmunizationRecord;
import com.ashacompanion.entity.Patient;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class ImmunizationAIEvaluator {

    public static final String CLINICAL_DISCLAIMER = "This is an AI-assisted preliminary screening result and does not replace professional clinical assessment.";

    public ImmunizationAIResponseDTO evaluate(Patient patient, List<ImmunizationRecord> records) {
        List<String> missedVaccines = new ArrayList<>();
        List<String> upcomingVaccines = new ArrayList<>();
        LocalDate today = LocalDate.now();

        int overdueCount = 0;
        int upcomingCount = 0;

        if (records != null) {
            for (ImmunizationRecord rec : records) {
                boolean administered = rec.isAdministered();
                LocalDate dueDate = rec.getNextDueDate() != null ? rec.getNextDueDate() : rec.getAdministeredDate();

                if (!administered && dueDate != null) {
                    String vName = rec.getVaccine() != null ? rec.getVaccine().getName() : ("Vaccine #" + rec.getId());
                    if (dueDate.isBefore(today)) {
                        overdueCount++;
                        missedVaccines.add(vName + " (Overdue since " + dueDate + ")");
                    } else if (dueDate.isBefore(today.plusDays(30))) {
                        upcomingCount++;
                        upcomingVaccines.add(vName + " (Due " + dueDate + ")");
                    }
                }
            }
        }

        String status;
        double riskScore;
        String explanation;
        String recommendedAction;

        if (overdueCount >= 2) {
            status = "HIGH_PRIORITY";
            riskScore = 85.0;
            explanation = "Child has " + overdueCount + " overdue vaccines and is at high risk of vaccine-preventable infection defaulter status.";
            recommendedAction = "Conduct an urgent home visit to mobilize child for immediate catch-up immunization session.";
        } else if (overdueCount == 1) {
            status = "OVERDUE";
            riskScore = 60.0;
            explanation = "Child has missed 1 scheduled vaccination dose past the target due date.";
            recommendedAction = "Notify parents and schedule attendance at the upcoming village health and nutrition day (VHND).";
        } else if (upcomingCount > 0) {
            status = "UPCOMING";
            riskScore = 25.0;
            explanation = "Child is up to date with past doses; " + upcomingCount + " upcoming vaccine dose(s) scheduled within 30 days.";
            recommendedAction = "Inform family about upcoming immunization date to ensure timely attendance.";
        } else {
            status = "ON_TRACK";
            riskScore = 5.0;
            explanation = "Child immunization schedule is fully up to date with no pending or overdue doses.";
            recommendedAction = "Maintain routine growth monitoring and follow age-appropriate vaccination calendar.";
        }

        return new ImmunizationAIResponseDTO(
            patient.getId(),
            patient.getName(),
            status,
            riskScore,
            missedVaccines,
            upcomingVaccines,
            explanation,
            recommendedAction,
            CLINICAL_DISCLAIMER
        );
    }
}
