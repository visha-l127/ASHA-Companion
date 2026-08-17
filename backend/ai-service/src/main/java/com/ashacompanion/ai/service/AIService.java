package com.ashacompanion.ai.service;

import com.ashacompanion.ai.dto.*;
import com.ashacompanion.ai.evaluator.*;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIService {

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;

    private final MaternalAIEvaluator maternalAIEvaluator;
    private final ImmunizationAIEvaluator immunizationAIEvaluator;
    private final NutritionAIEvaluator nutritionAIEvaluator;
    private final MedicineForecastEvaluator medicineForecastEvaluator;
    private final MedicineExpiryEvaluator medicineExpiryEvaluator;

    public AIService(
        RestTemplate restTemplate,
        UserRepository userRepository,
        MaternalAIEvaluator maternalAIEvaluator,
        ImmunizationAIEvaluator immunizationAIEvaluator,
        NutritionAIEvaluator nutritionAIEvaluator,
        MedicineForecastEvaluator medicineForecastEvaluator,
        MedicineExpiryEvaluator medicineExpiryEvaluator
    ) {
        this.restTemplate = restTemplate;
        this.userRepository = userRepository;
        this.maternalAIEvaluator = maternalAIEvaluator;
        this.immunizationAIEvaluator = immunizationAIEvaluator;
        this.nutritionAIEvaluator = nutritionAIEvaluator;
        this.medicineForecastEvaluator = medicineForecastEvaluator;
        this.medicineExpiryEvaluator = medicineExpiryEvaluator;
    }

    private void validatePatientAccess(Patient patient, User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required");
        }

        String role = currentUser.getRole();
        if ("ADMIN".equals(role)) {
            return; // Global access
        }

        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Pharmacists are not authorized to access clinical patient AI endpoints");
        }

        if ("ASHA".equals(role)) {
            if (patient.getAshaWorkerId() != null && !Objects.equals(patient.getAshaWorkerId(), currentUser.getId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to a different ASHA worker");
            }
            return;
        }

        if ("PHC_SUPERVISOR".equals(role)) {
            if (currentUser.getPhcId() != null && patient.getPhcId() != null && !currentUser.getPhcId().equals(patient.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to a different PHC facility");
            }
            return;
        }

        throw new AccessDeniedException("Access denied for role: " + role);
    }

    private void validatePharmacyAccess(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required");
        }

        String role = currentUser.getRole();
        if ("ADMIN".equals(role) || "PHC_SUPERVISOR".equals(role) || "PHARMACIST".equals(role)) {
            return;
        }

        throw new AccessDeniedException("Access denied: ASHA workers are not authorized to access medicine inventory AI endpoints");
    }

    // 1. Maternal AI Risk
    public MaternalAIResponseDTO getMaternalAIRisk(Long pregnancyId, User currentUser) {
        Pregnancy pregnancy = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/" + pregnancyId, Pregnancy.class);
        if (pregnancy == null) {
            throw new ResourceNotFoundException("Pregnancy not found with id: " + pregnancyId);
        }

        Long patientId = pregnancy.getPatient() != null ? pregnancy.getPatient().getId() : 0L;
        Patient patient = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + patientId, Patient.class);
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }

        validatePatientAccess(patient, currentUser);

        AntenatalVisit[] visitsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/antenatal-visits/pregnancy/" + pregnancyId, AntenatalVisit[].class);
        List<AntenatalVisit> visits = visitsArray == null ? Collections.emptyList() : Arrays.asList(visitsArray);

        return maternalAIEvaluator.evaluate(pregnancy, patient, visits);
    }

    // 2. Immunization AI Risk
    public ImmunizationAIResponseDTO getImmunizationAIRisk(Long patientId, User currentUser) {
        Patient patient = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + patientId, Patient.class);
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }

        validatePatientAccess(patient, currentUser);

        ImmunizationRecord[] recordsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/patient/" + patientId, ImmunizationRecord[].class);
        List<ImmunizationRecord> records = recordsArray == null ? Collections.emptyList() : Arrays.asList(recordsArray);

        return immunizationAIEvaluator.evaluate(patient, records);
    }

    // 3. Nutrition AI Risk
    public NutritionAIResponseDTO getNutritionAIRisk(Long patientId, User currentUser) {
        Patient patient = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + patientId, Patient.class);
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }

        validatePatientAccess(patient, currentUser);

        NutritionRecord[] recordsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/patient/" + patientId, NutritionRecord[].class);
        List<NutritionRecord> records = recordsArray == null ? Collections.emptyList() : Arrays.asList(recordsArray);

        return nutritionAIEvaluator.evaluate(patient, records);
    }

    // 4. Medicine Demand Forecast
    public MedicineForecastResponseDTO getMedicineDemandForecast(String medicineCode, User currentUser) {
        validatePharmacyAccess(currentUser);

        Medicine medicine = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicines/code/" + medicineCode, Medicine.class);
        if (medicine == null) {
            throw new ResourceNotFoundException("Medicine not found with code: " + medicineCode);
        }

        String targetPhcId = (currentUser.getPhcId() != null && !currentUser.getPhcId().isBlank())
            ? currentUser.getPhcId()
            : "PHC_MAIN";

        MedicineBatch[] batchesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicine-batches/medicine/" + medicine.getId() + "/active", MedicineBatch[].class);
        List<MedicineBatch> batches = batchesArray == null ? Collections.emptyList() : Arrays.asList(batchesArray);
        int currentStock = batches.stream().mapToInt(b -> b.getQuantity() != null ? b.getQuantity() : 0).sum();

        MedicineTransaction[] txArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicine-transactions/medicine/" + medicine.getId() + "/phc/" + targetPhcId, MedicineTransaction[].class);
        List<MedicineTransaction> transactions = txArray == null ? Collections.emptyList() : Arrays.asList(txArray);

        return medicineForecastEvaluator.evaluate(medicine, targetPhcId, currentStock, transactions);
    }

    // 5. Medicine Expiry Risk
    public MedicineExpiryAIResponseDTO getMedicineExpiryRisk(String medicineCode, User currentUser) {
        validatePharmacyAccess(currentUser);

        Medicine medicine = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicines/code/" + medicineCode, Medicine.class);
        if (medicine == null) {
            throw new ResourceNotFoundException("Medicine not found with code: " + medicineCode);
        }

        String targetPhcId = (currentUser.getPhcId() != null && !currentUser.getPhcId().isBlank())
            ? currentUser.getPhcId()
            : "PHC_MAIN";

        MedicineBatch[] batchesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicine-batches/medicine/" + medicine.getId() + "/active", MedicineBatch[].class);
        List<MedicineBatch> batches = batchesArray == null ? Collections.emptyList() : Arrays.asList(batchesArray);
        MedicineBatch targetBatch = batches.isEmpty() ? null : batches.get(0);

        MedicineTransaction[] txArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicine-transactions/medicine/" + medicine.getId() + "/phc/" + targetPhcId, MedicineTransaction[].class);
        List<MedicineTransaction> transactions = txArray == null ? Collections.emptyList() : Arrays.asList(txArray);

        MedicineForecastResponseDTO forecast = medicineForecastEvaluator.evaluate(medicine, targetPhcId, 100, transactions);
        int demand = forecast.getEstimatedDemand() != null ? forecast.getEstimatedDemand() : 30;

        return medicineExpiryEvaluator.evaluate(medicine, targetBatch, demand);
    }

    // 6. Patient AI Overview
    public PatientAIOverviewDTO getPatientAIOverview(Long patientId, User currentUser) {
        Patient patient = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + patientId, Patient.class);
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }

        validatePatientAccess(patient, currentUser);

        // Attempt maternal AI if pregnancy exists
        MaternalAIResponseDTO maternal = null;
        Pregnancy[] pregnanciesArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/patient/" + patientId, Pregnancy[].class);
        List<Pregnancy> pregnancies = pregnanciesArray == null ? Collections.emptyList() : Arrays.asList(pregnanciesArray);
        
        if (!pregnancies.isEmpty()) {
            Pregnancy p = pregnancies.get(0);
            AntenatalVisit[] visitsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/antenatal-visits/pregnancy/" + p.getId(), AntenatalVisit[].class);
            List<AntenatalVisit> visits = visitsArray == null ? Collections.emptyList() : Arrays.asList(visitsArray);
            maternal = maternalAIEvaluator.evaluate(p, patient, visits);
        }

        ImmunizationRecord[] immRecordsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/patient/" + patientId, ImmunizationRecord[].class);
        List<ImmunizationRecord> immRecords = immRecordsArray == null ? Collections.emptyList() : Arrays.asList(immRecordsArray);
        ImmunizationAIResponseDTO immunization = immunizationAIEvaluator.evaluate(patient, immRecords);

        NutritionRecord[] nutRecordsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/patient/" + patientId, NutritionRecord[].class);
        List<NutritionRecord> nutRecords = nutRecordsArray == null ? Collections.emptyList() : Arrays.asList(nutRecordsArray);
        NutritionAIResponseDTO nutrition = nutritionAIEvaluator.evaluate(patient, nutRecords);

        String summary;
        if (maternal != null && "HIGH".equals(maternal.getRiskLevel())) {
            summary = "HIGH RISK: Patient flagged with high maternal health risk indicators.";
        } else if ("HIGH_PRIORITY".equals(immunization.getStatus()) || "OVERDUE".equals(immunization.getStatus())) {
            summary = "ATTENTION REQUIRED: Overdue immunization schedule detected.";
        } else if ("HIGH".equals(nutrition.getRiskLevel()) || "AT_RISK".equals(nutrition.getRiskLevel())) {
            summary = "NUTRITION ALERT: Child growth monitoring indicates nutritional risk.";
        } else {
            summary = "LOW RISK: All clinical parameters and care schedules are on track.";
        }

        return new PatientAIOverviewDTO(
            patient.getId(),
            patient.getName(),
            maternal,
            immunization,
            nutrition,
            summary
        );
    }

    // 7. AI Dashboard Summary
    public AIDashboardSummaryDTO getAIDashboardSummary(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required");
        }

        String role = currentUser.getRole();

        if ("PHARMACIST".equals(role)) {
            // Pharmacists get inventory AI counts only
            long stockout = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/batches/stockout-count", Long.class);
            long expiry = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/batches/expiry-count", Long.class);
            return new AIDashboardSummaryDTO(0, 0, 0, stockout, expiry);
        }

        long highRiskMaternal = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/maternal/high-risk-count", Long.class);
        long immunizationDefaulter = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunization/defaulter-count", Long.class);
        long nutritionRisk = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition/risk-count", Long.class);
        long stockout = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/batches/stockout-count", Long.class);
        long expiry = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/batches/expiry-count", Long.class);

        return new AIDashboardSummaryDTO(
            highRiskMaternal,
            immunizationDefaulter,
            nutritionRisk,
            stockout,
            expiry
        );
    }

    public List<AIPrioritizedVisitDTO> getAIPrioritizedVisits(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required");
        }

        Long ashaIdVal = currentUser.getId();

        Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/asha/" + ashaIdVal, Patient[].class);
        List<Patient> patients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);

        PriorityVisit[] priorityVisitsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/priority-visits", PriorityVisit[].class);
        List<PriorityVisit> assignedPriorityVisits = priorityVisitsArray == null ? Collections.emptyList() : Arrays.asList(priorityVisitsArray);
        List<PriorityVisit> myPriorityVisits = new ArrayList<>();
        for (PriorityVisit v : assignedPriorityVisits) {
            if (currentUser.getUsername().equals(v.getAshaId())) {
                myPriorityVisits.add(v);
            }
        }

        List<AIPrioritizedVisitDTO> prioritizedList = new ArrayList<>();

        for (Patient p : patients) {
            if (!p.isActive()) {
                continue;
            }

            int score = 0;
            List<String> reasons = new ArrayList<>();

            // A. Maternal High Risk Evaluation
            Pregnancy[] pregnanciesArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/patient/" + p.getId(), Pregnancy[].class);
            List<Pregnancy> pregnancies = pregnanciesArray == null ? Collections.emptyList() : Arrays.asList(pregnanciesArray);
            for (Pregnancy preg : pregnancies) {
                boolean active = preg.isActive();
                if (!active || preg.getPregnancyStatus() == PregnancyStatus.DELIVERED || preg.getPregnancyStatus() == PregnancyStatus.CANCELLED) {
                    continue;
                }
                if (preg.isHighRisk()) {
                    score += 45;
                    reasons.add("High-risk pregnancy: " + (preg.getRiskFactors() != null ? preg.getRiskFactors() : "Severe Risk"));
                }
                if (preg.getGravida() != null && preg.getGravida() >= 5) {
                    score += 15;
                    reasons.add("High gravida maternal risk (Gravida: " + preg.getGravida() + ")");
                }

                // Check abnormal vitals in latest ANC visit
                AntenatalVisit[] visitsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/antenatal-visits/pregnancy/" + preg.getId(), AntenatalVisit[].class);
                if (visitsArray != null && visitsArray.length > 0) {
                    AntenatalVisit latestVisit = Arrays.stream(visitsArray)
                            .max(Comparator.comparing(AntenatalVisit::getVisitDate))
                            .orElse(null);
                    if (latestVisit != null) {
                        if ((latestVisit.getSystolicBp() != null && latestVisit.getSystolicBp() >= 140) ||
                            (latestVisit.getDiastolicBp() != null && latestVisit.getDiastolicBp() >= 90)) {
                            score += 25;
                            reasons.add("Abnormal blood pressure in latest ANC (BP: " + latestVisit.getSystolicBp() + "/" + latestVisit.getDiastolicBp() + " mmHg)");
                        }
                        if (latestVisit.getHemoglobin() != null && latestVisit.getHemoglobin().compareTo(new java.math.BigDecimal("11.0")) < 0) {
                            score += 20;
                            reasons.add("Maternal anemia detected in latest ANC (Hb: " + latestVisit.getHemoglobin() + " g/dL)");
                        }
                    }
                }
            }

            // B. Child Malnutrition / Nutrition Risk
            NutritionRecord[] nutritionRecordsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/patient/" + p.getId(), NutritionRecord[].class);
            if (nutritionRecordsArray != null && nutritionRecordsArray.length > 0) {
                NutritionRecord latestNutrition = nutritionRecordsArray[0];
                if (latestNutrition.isRiskFlag()) {
                    score += 20;
                    reasons.add("Growth monitoring: Nutrition risk flag triggered");
                }
                if (latestNutrition.getMuacCm() != null) {
                    double muac = latestNutrition.getMuacCm();
                    if (muac < 11.5) {
                        score += 45;
                        reasons.add("Child MUAC indicates Severe Acute Malnutrition (MUAC: " + muac + " cm)");
                    } else if (muac < 12.5) {
                        score += 25;
                        reasons.add("Child MUAC indicates Moderate Acute Malnutrition (MUAC: " + muac + " cm)");
                    }
                }
            }

            // C. Immunization Overdue / Defaulter Status
            ImmunizationRecord[] recordsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/patient/" + p.getId(), ImmunizationRecord[].class);
            if (recordsArray != null && recordsArray.length > 0) {
                long pendingDoses = Arrays.stream(recordsArray)
                        .filter(im -> !im.isAdministered())
                        .count();
                if (pendingDoses > 0) {
                    score += 15;
                    reasons.add("Pending immunization doses count: " + pendingDoses);
                }
            }

            // D. Supervisor Assigned Priority Visit Status
            PriorityVisit myAssignedVisit = null;
            for (PriorityVisit v : myPriorityVisits) {
                if (v.getPatientName() != null && v.getPatientName().equalsIgnoreCase(p.getName())) {
                    myAssignedVisit = v;
                    break;
                }
            }

            String condition = null;
            String notes = null;
            java.time.LocalDate assignedDate = null;
            String status = null;

            if (myAssignedVisit != null) {
                score += 30;
                reasons.add("Supervisor-assigned priority visit: " + myAssignedVisit.getCondition());
                if ("CRITICAL".equalsIgnoreCase(myAssignedVisit.getUrgency())) {
                    score += 30;
                } else if ("HIGH".equalsIgnoreCase(myAssignedVisit.getUrgency())) {
                    score += 15;
                }

                condition = myAssignedVisit.getCondition();
                notes = myAssignedVisit.getNotes();
                assignedDate = myAssignedVisit.getAssignedDate();
                status = myAssignedVisit.getStatus();
            }

            if (score > 100) {
                score = 100;
            }

            if (score > 0) {
                String priorityLevel = "LOW";
                if (score >= 80) {
                    priorityLevel = "CRITICAL";
                } else if (score >= 50) {
                    priorityLevel = "HIGH";
                } else if (score >= 25) {
                    priorityLevel = "MEDIUM";
                }

                prioritizedList.add(new AIPrioritizedVisitDTO(
                    p.getId(),
                    p.getName(),
                    p.getVillage(),
                    score,
                    priorityLevel,
                    reasons,
                    condition,
                    notes,
                    assignedDate,
                    status
                ));
            }
        }

        // Sort by priorityScore descending
        prioritizedList.sort((a, b) -> Integer.compare(b.getPriorityScore(), a.getPriorityScore()));

        return prioritizedList;
    }
}
