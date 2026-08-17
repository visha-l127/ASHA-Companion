package com.ashacompanion.service;

import com.ashacompanion.dto.*;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.HealthRiskAssessmentRepository;
import com.ashacompanion.ai.evaluator.MaternalAIEvaluator;
import com.ashacompanion.ai.evaluator.NutritionAIEvaluator;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HealthRiskIntelligenceService {

    private final RestTemplate restTemplate;
    private final HealthRiskAssessmentRepository healthRiskAssessmentRepository;

    public HealthRiskIntelligenceService(RestTemplate restTemplate,
                                          HealthRiskAssessmentRepository healthRiskAssessmentRepository) {
        this.restTemplate = restTemplate;
        this.healthRiskAssessmentRepository = healthRiskAssessmentRepository;
    }

    public void checkPatientAccess(Patient patient, User currentUser) {
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Access denied: Pharmacist cannot access clinical patient risk information");
        }
        if ("ADMIN".equals(role)) {
            return;
        }
        if ("PHC_SUPERVISOR".equals(role)) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(patient.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
            return;
        }
        if ("ASHA".equals(role)) {
            if (currentUser.getId() == null || !currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
            return;
        }
        throw new AccessDeniedException("Access denied: Insufficient privileges");
    }

    @Transactional
    public HealthRiskAssessmentResponseDTO evaluatePatientRisk(Long patientId, User currentUser) {
        Patient patient = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + patientId, Patient.class);
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found with ID: " + patientId);
        }

        checkPatientAccess(patient, currentUser);

        List<String> combinedFactors = new ArrayList<>();
        String highestRiskLevel = "LOW";
        int score = 0;

        // 1. Maternal Risk Evaluation
        Pregnancy[] pregnanciesArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/patient/" + patientId, Pregnancy[].class);
        List<Pregnancy> pregnancies = pregnanciesArray == null ? Collections.emptyList() : Arrays.asList(pregnanciesArray);
        
        for (Pregnancy preg : pregnancies) {
            boolean active = preg.isActive();
            if (!active || preg.getPregnancyStatus() == PregnancyStatus.DELIVERED || preg.getPregnancyStatus() == PregnancyStatus.CANCELLED) {
                continue;
            }

            boolean isHigh = preg.isHighRisk();
            if (isHigh || (preg.getGravida() != null && preg.getGravida() >= 5)) {
                highestRiskLevel = "HIGH";
                score += 40;
                combinedFactors.add("High-risk pregnancy flagged (" + (preg.getRiskFactors() != null ? preg.getRiskFactors() : "High gravida") + ")");
            }

            AntenatalVisit[] visitsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/antenatal-visits/pregnancy/" + preg.getId(), AntenatalVisit[].class);
            List<AntenatalVisit> visits = visitsArray == null ? Collections.emptyList() : Arrays.asList(visitsArray);
            
            for (AntenatalVisit v : visits) {
                boolean vActive = v.isActive();
                if (vActive) {
                    boolean ancHigh = false;
                    List<String> vFactors = new ArrayList<>();
                    if (v.getSystolicBp() != null && v.getDiastolicBp() != null && (v.getSystolicBp() >= 140 || v.getDiastolicBp() >= 90)) {
                        ancHigh = true;
                        vFactors.add("Elevated BP");
                    }
                    if (v.getHemoglobin() != null && v.getHemoglobin().doubleValue() < 11.0) {
                        ancHigh = true;
                        vFactors.add("Anemia");
                    }
                    if (ancHigh) {
                        highestRiskLevel = "HIGH";
                        score += 30;
                        combinedFactors.add("ANC visit warning: " + String.join(", ", vFactors));
                    }
                }
            }
        }

        // 2. Immunization Defaulter Evaluation
        LocalDate today = LocalDate.now();
        ImmunizationRecord[] immunizationsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/patient/" + patientId, ImmunizationRecord[].class);
        List<ImmunizationRecord> immunizations = immunizationsArray == null ? Collections.emptyList() : Arrays.asList(immunizationsArray);
        
        for (ImmunizationRecord imm : immunizations) {
            boolean administered = imm.isAdministered();
            if (!administered && imm.getNextDueDate() != null) {
                String vName = imm.getVaccine() != null ? imm.getVaccine().getName() : "Vaccine";
                if (imm.getNextDueDate().isBefore(today)) {
                    if (!"HIGH".equals(highestRiskLevel)) {
                        highestRiskLevel = "HIGH";
                    }
                    score += 25;
                    combinedFactors.add("Overdue immunization: " + vName + " (Dose " + imm.getDoseNumber() + ") was due on " + imm.getNextDueDate());
                } else if (!imm.getNextDueDate().isAfter(today.plusDays(30))) {
                    if ("LOW".equals(highestRiskLevel)) {
                        highestRiskLevel = "MEDIUM";
                    }
                    score += 10;
                    combinedFactors.add("Upcoming immunization: " + vName + " (Dose " + imm.getDoseNumber() + ") is due on " + imm.getNextDueDate());
                }
            }
        }

        // 3. Child Malnutrition Evaluation
        NutritionRecord[] nutritionArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/patient/" + patientId, NutritionRecord[].class);
        List<NutritionRecord> nutritionRecords = nutritionArray == null ? Collections.emptyList() : Arrays.asList(nutritionArray);
        
        if (!nutritionRecords.isEmpty()) {
            NutritionRecord nut = nutritionRecords.get(0);
            if (nut.getNutritionStatus() != null) {
                String status = nut.getNutritionStatus().toString();
                if ("HIGH_RISK".equals(status)) {
                    highestRiskLevel = "HIGH";
                    score += 35;
                    combinedFactors.add("Severe malnutrition risk: " + (nut.getRiskFactors() != null ? nut.getRiskFactors() : "Severe MUAC wasting"));
                } else if ("MODERATE_RISK".equals(status) || "AT_RISK".equals(status)) {
                    if ("LOW".equals(highestRiskLevel)) {
                        highestRiskLevel = "MEDIUM";
                    }
                    score += 15;
                    combinedFactors.add("Moderate nutrition risk: " + (nut.getRiskFactors() != null ? nut.getRiskFactors() : "MUAC/growth monitoring warning"));
                }
            }
        }

        String factorsStr = combinedFactors.isEmpty() ? "No active clinical risk factors identified" : String.join("; ", combinedFactors);

        HealthRiskAssessment assessment = new HealthRiskAssessment();
        assessment.setPatientId(patientId);
        assessment.setPhcId(patient.getPhcId());
        assessment.setAssessmentType("COMBINED");
        assessment.setRiskLevel(highestRiskLevel);
        assessment.setRiskScore(String.valueOf(score));
        assessment.setRiskFactors(factorsStr);
        assessment.setAssessedBy(currentUser.getId());

        HealthRiskAssessment saved = healthRiskAssessmentRepository.save(assessment);

        HealthRiskAssessmentResponseDTO dto = new HealthRiskAssessmentResponseDTO(saved);
        dto.setPatientName(patient.getName());
        return dto;
    }

    public List<HealthRiskAssessmentResponseDTO> getPatientAssessments(Long patientId, User currentUser) {
        Patient patient = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + patientId, Patient.class);
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found with ID: " + patientId);
        }

        checkPatientAccess(patient, currentUser);

        List<HealthRiskAssessment> assessments = healthRiskAssessmentRepository.findByPatientIdOrderByAssessedAtDesc(patientId);
        return assessments.stream().map(a -> {
            HealthRiskAssessmentResponseDTO dto = new HealthRiskAssessmentResponseDTO(a);
            dto.setPatientName(patient.getName());
            return dto;
        }).collect(Collectors.toList());
    }

    public List<HealthRiskAssessmentResponseDTO> getHighRiskPatients(User currentUser) {
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Access denied: Pharmacists cannot access clinical risk assessments");
        }

        List<HealthRiskAssessment> highRiskList;
        if ("ADMIN".equals(role)) {
            highRiskList = healthRiskAssessmentRepository.findByRiskLevel("HIGH");
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            highRiskList = (phcId != null) ? healthRiskAssessmentRepository.findByPhcIdAndRiskLevelInOrderByAssessedAtDesc(phcId, List.of("HIGH")) : Collections.emptyList();
        } else {
            // ASHA worker
            Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/asha/" + currentUser.getId(), Patient[].class);
            List<Patient> ashaPatients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
            Set<Long> patientIds = ashaPatients.stream().map(Patient::getId).collect(Collectors.toSet());
            highRiskList = healthRiskAssessmentRepository.findByRiskLevel("HIGH").stream()
                    .filter(a -> patientIds.contains(a.getPatientId()))
                    .collect(Collectors.toList());
        }

        Map<Long, String> patientNames = new HashMap<>();
        for (HealthRiskAssessment a : highRiskList) {
            if (!patientNames.containsKey(a.getPatientId())) {
                try {
                    Patient p = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + a.getPatientId(), Patient.class);
                    if (p != null) {
                        patientNames.put(p.getId(), p.getName());
                    }
                } catch (Exception e) {
                    // Ignore patient fetch error
                }
            }
        }

        return highRiskList.stream().map(a -> {
            HealthRiskAssessmentResponseDTO dto = new HealthRiskAssessmentResponseDTO(a);
            dto.setPatientName(patientNames.get(a.getPatientId()));
            return dto;
        }).collect(Collectors.toList());
    }

    public HealthRiskSummaryDTO getSummary(User currentUser) {
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Access denied: Pharmacists cannot access clinical risk summary");
        }

        List<Patient> scopedPatients;
        if ("ADMIN".equals(role)) {
            Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients", Patient[].class);
            scopedPatients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId != null) {
                Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/phc/" + phcId, Patient[].class);
                scopedPatients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
            } else {
                scopedPatients = Collections.emptyList();
            }
        } else {
            Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/asha/" + currentUser.getId(), Patient[].class);
            scopedPatients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
        }

        long total = scopedPatients.size();
        long highRiskMaternal = 0;
        long overdueImmunization = 0;
        long highRiskNutrition = 0;

        LocalDate today = LocalDate.now();

        for (Patient p : scopedPatients) {
            // Maternal risk check
            Pregnancy[] pregnanciesArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/patient/" + p.getId(), Pregnancy[].class);
            List<Pregnancy> pregList = pregnanciesArray == null ? Collections.emptyList() : Arrays.asList(pregnanciesArray);
            if (pregList.stream().anyMatch(pr -> {
                boolean active = pr.isActive();
                boolean isHigh = pr.isHighRisk();
                return active && isHigh;
            })) {
                highRiskMaternal++;
            }

            // Immunization overdue check
            ImmunizationRecord[] immunizationsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/patient/" + p.getId(), ImmunizationRecord[].class);
            List<ImmunizationRecord> immList = immunizationsArray == null ? Collections.emptyList() : Arrays.asList(immunizationsArray);
            if (immList.stream().anyMatch(i -> {
                boolean administered = i.isAdministered();
                return !administered && i.getNextDueDate() != null && i.getNextDueDate().isBefore(today);
            })) {
                overdueImmunization++;
            }

            // Nutrition high risk check
            NutritionRecord[] nutritionArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/patient/" + p.getId(), NutritionRecord[].class);
            List<NutritionRecord> nutList = nutritionArray == null ? Collections.emptyList() : Arrays.asList(nutritionArray);
            if (!nutList.isEmpty()) {
                NutritionRecord nut = nutList.get(0);
                if (nut.getNutritionStatus() != null && "HIGH_RISK".equals(nut.getNutritionStatus().toString())) {
                    highRiskNutrition++;
                }
            }
        }

        return new HealthRiskSummaryDTO(total, highRiskMaternal, overdueImmunization, highRiskNutrition);
    }
}
