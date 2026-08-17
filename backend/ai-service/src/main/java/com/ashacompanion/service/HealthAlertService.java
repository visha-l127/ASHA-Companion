package com.ashacompanion.service;

import com.ashacompanion.dto.HealthRiskAlertResponseDTO;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.HealthRiskAlertRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HealthAlertService {

    private final HealthRiskAlertRepository alertRepository;
    private final RestTemplate restTemplate;

    public HealthAlertService(HealthRiskAlertRepository alertRepository, RestTemplate restTemplate) {
        this.alertRepository = alertRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public List<HealthRiskAlertResponseDTO> generateAlerts(User currentUser) {
        List<HealthRiskAlert> generated = new ArrayList<>();
        LocalDate today = LocalDate.now();
        String role = currentUser.getRole();

        // 1. Clinical Alerts (ADMIN, PHC_SUPERVISOR, ASHA)
        if (!"PHARMACIST".equals(role)) {
            List<Patient> patients;
            if ("ADMIN".equals(role)) {
                Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients", Patient[].class);
                patients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
            } else if ("PHC_SUPERVISOR".equals(role)) {
                String phcId = currentUser.getPhcId();
                if (phcId != null) {
                    Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/phc/" + phcId, Patient[].class);
                    patients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
                } else {
                    patients = Collections.emptyList();
                }
            } else {
                Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/asha/" + currentUser.getId(), Patient[].class);
                patients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
            }

            for (Patient p : patients) {
                if (!p.isActive()) {
                    continue;
                }

                // A. High Risk Pregnancy
                Pregnancy[] pregnanciesArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/patient/" + p.getId(), Pregnancy[].class);
                List<Pregnancy> pregnancies = pregnanciesArray == null ? Collections.emptyList() : Arrays.asList(pregnanciesArray);
                
                for (Pregnancy preg : pregnancies) {
                    if ((preg.isActive()) && 
                        ((preg.isHighRisk()) || (preg.getGravida() != null && preg.getGravida() >= 5))) {
                        if (!alertRepository.existsByPatientIdAndAlertTypeAndAcknowledged(p.getId(), "HIGH_RISK_PREGNANCY", 0)) {
                            HealthRiskAlert alert = new HealthRiskAlert();
                            alert.setPatientId(p.getId());
                            alert.setPhcId(p.getPhcId());
                            alert.setAlertType("HIGH_RISK_PREGNANCY");
                            alert.setSeverity("HIGH");
                            alert.setTitle("High Risk Pregnancy Alert");
                            alert.setMessage("Patient " + p.getName() + " flagged as high-risk pregnancy");
                            alert.setRiskFactors(preg.getRiskFactors() != null ? preg.getRiskFactors() : "High gravida / clinical factors");
                            alert.setGeneratedBy(currentUser.getId());
                            generated.add(alertRepository.save(alert));
                        }
                    }
                }

                // B. Overdue Immunization
                ImmunizationRecord[] immunizationsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/patient/" + p.getId(), ImmunizationRecord[].class);
                List<ImmunizationRecord> immunizations = immunizationsArray == null ? Collections.emptyList() : Arrays.asList(immunizationsArray);
                
                for (ImmunizationRecord imm : immunizations) {
                    boolean administered = imm.isAdministered();
                    if (!administered && imm.getNextDueDate() != null && imm.getNextDueDate().isBefore(today)) {
                        String vName = imm.getVaccine() != null ? imm.getVaccine().getName() : "Vaccine";
                        if (!alertRepository.existsByPatientIdAndAlertTypeAndAcknowledged(p.getId(), "OVERDUE_IMMUNIZATION", 0)) {
                            HealthRiskAlert alert = new HealthRiskAlert();
                            alert.setPatientId(p.getId());
                            alert.setPhcId(p.getPhcId());
                            alert.setAlertType("OVERDUE_IMMUNIZATION");
                            alert.setSeverity("HIGH");
                            alert.setTitle("Overdue Vaccination");
                            alert.setMessage(vName + " (Dose " + imm.getDoseNumber() + ") is overdue for " + p.getName());
                            alert.setRiskFactors(vName + " dose " + imm.getDoseNumber() + " was due on " + imm.getNextDueDate());
                            alert.setGeneratedBy(currentUser.getId());
                            generated.add(alertRepository.save(alert));
                        }
                    }
                }

                // C. High Risk Nutrition
                NutritionRecord[] nutritionArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/patient/" + p.getId(), NutritionRecord[].class);
                List<NutritionRecord> nutritionRecords = nutritionArray == null ? Collections.emptyList() : Arrays.asList(nutritionArray);
                
                if (!nutritionRecords.isEmpty()) {
                    NutritionRecord nut = nutritionRecords.get(0);
                    if (nut.getNutritionStatus() != null && "HIGH_RISK".equals(nut.getNutritionStatus().toString())) {
                        if (!alertRepository.existsByPatientIdAndAlertTypeAndAcknowledged(p.getId(), "HIGH_RISK_NUTRITION", 0)) {
                            HealthRiskAlert alert = new HealthRiskAlert();
                            alert.setPatientId(p.getId());
                            alert.setPhcId(p.getPhcId());
                            alert.setAlertType("HIGH_RISK_NUTRITION");
                            alert.setSeverity("HIGH");
                            alert.setTitle("Severe Malnutrition Risk");
                            alert.setMessage("Child " + p.getName() + " has severe acute malnutrition risk");
                            alert.setRiskFactors(nut.getRiskFactors() != null ? nut.getRiskFactors() : "Severe MUAC/BMI proxy wasting");
                            alert.setGeneratedBy(currentUser.getId());
                            generated.add(alertRepository.save(alert));
                        }
                    }
                }
            }
        }

        // 2. Pharmacy Medicine Inventory Alerts (ADMIN, PHC_SUPERVISOR, PHARMACIST)
        if ("ADMIN".equals(role) || "PHC_SUPERVISOR".equals(role) || "PHARMACIST".equals(role)) {
            String phcId = currentUser.getPhcId();
            if ("ADMIN".equals(role) || phcId != null) {
                Medicine[] medicinesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicines", Medicine[].class);
                List<Medicine> medicines = medicinesArray == null ? Collections.emptyList() : Arrays.asList(medicinesArray);
                
                for (Medicine med : medicines) {
                    if (med.getActiveFlag() != null && med.getActiveFlag() == 0) {
                        continue;
                    }
                    
                    MedicineBatch[] batchesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicine-batches/medicine/" + med.getId() + "/active", MedicineBatch[].class);
                    List<MedicineBatch> batches = batchesArray == null ? Collections.emptyList() : Arrays.asList(batchesArray);
                    
                    if (!"ADMIN".equals(role) && phcId != null) {
                        batches = batches.stream().filter(b -> phcId.equals(b.getPhcId())).collect(Collectors.toList());
                    }

                    int totalStock = batches.stream()
                            .filter(b -> b.getExpiryDate() != null && !b.getExpiryDate().isBefore(today))
                            .mapToInt(b -> b.getQuantity() != null ? b.getQuantity() : 0).sum();

                    int reorder = med.getReorderLevel() != null ? med.getReorderLevel() : 0;
                    if (totalStock <= reorder) {
                        String targetPhc = phcId != null ? phcId : "GLOBAL";
                        if (!alertRepository.existsByPhcIdAndAlertTypeAndAcknowledged(targetPhc, "LOW_MEDICINE_STOCK", 0)) {
                            HealthRiskAlert alert = new HealthRiskAlert();
                            alert.setPhcId(targetPhc);
                            alert.setAlertType("LOW_MEDICINE_STOCK");
                            alert.setSeverity("HIGH");
                            alert.setTitle("Low Medicine Stock Alert");
                            alert.setMessage(med.getName() + " stock level (" + totalStock + ") is below reorder level (" + reorder + ")");
                            alert.setRiskFactors("Reorder level: " + reorder + ", Available: " + totalStock);
                            alert.setGeneratedBy(currentUser.getId());
                            generated.add(alertRepository.save(alert));
                        }
                    }
                }
            }
        }

        return generated.stream().map(a -> mapToDTO(a)).collect(Collectors.toList());
    }

    public List<HealthRiskAlertResponseDTO> getAlerts(User currentUser) {
        String role = currentUser.getRole();
        List<HealthRiskAlert> alerts;

        if ("ADMIN".equals(role)) {
            alerts = alertRepository.findAll();
        } else if ("PHC_SUPERVISOR".equals(role) || "PHARMACIST".equals(role)) {
            String phcId = currentUser.getPhcId();
            alerts = (phcId != null) ? alertRepository.findByPhcIdOrderByCreatedAtDesc(phcId) : Collections.emptyList();
            if ("PHARMACIST".equals(role)) {
                alerts = alerts.stream()
                        .filter(a -> "LOW_MEDICINE_STOCK".equals(a.getAlertType()) || "EXPIRING_MEDICINE".equals(a.getAlertType()))
                        .collect(Collectors.toList());
            }
        } else {
            // ASHA
            Patient[] patientsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/asha/" + currentUser.getId(), Patient[].class);
            List<Patient> ashaPatients = patientsArray == null ? Collections.emptyList() : Arrays.asList(patientsArray);
            Set<Long> patientIds = ashaPatients.stream().map(Patient::getId).collect(Collectors.toSet());
            alerts = alertRepository.findAll().stream()
                    .filter(a -> a.getPatientId() != null && patientIds.contains(a.getPatientId()))
                    .collect(Collectors.toList());
        }

        return alerts.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<HealthRiskAlertResponseDTO> getUnacknowledgedAlerts(User currentUser) {
        return getAlerts(currentUser).stream()
                .filter(a -> !a.isAcknowledged())
                .collect(Collectors.toList());
    }

    public HealthRiskAlertResponseDTO getAlertById(Long alertId, User currentUser) {
        HealthRiskAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Health alert not found with ID: " + alertId));

        checkAlertAccess(alert, currentUser);
        return mapToDTO(alert);
    }

    @Transactional
    public HealthRiskAlertResponseDTO acknowledgeAlert(Long alertId, User currentUser) {
        HealthRiskAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Health alert not found with ID: " + alertId));

        checkAlertAccess(alert, currentUser);

        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(currentUser.getId());

        HealthRiskAlert saved = alertRepository.save(alert);
        
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("action", "ALERT_ACKNOWLEDGED");
            req.put("entityType", "HEALTH_ALERT");
            req.put("entityId", String.valueOf(saved.getId()));
            req.put("performedBy", currentUser.getId());
            req.put("performedByName", currentUser.getUsername());
            req.put("details", "Acknowledged alert: " + saved.getTitle());
            req.put("httpStatus", "SUCCESS");
            req.put("httpMethod", "PATCH");
            req.put("requestPath", "/health-alerts/" + alertId + "/acknowledge");
            restTemplate.postForObject("http://ADMIN-SERVICE/internal/audit-logs", req, Void.class);
        } catch (Exception e) {
            // Ignore integration logging error to keep transaction stable
        }
        
        return mapToDTO(saved);
    }

    private void checkAlertAccess(HealthRiskAlert alert, User currentUser) {
        String role = currentUser.getRole();
        if ("ADMIN".equals(role)) {
            return;
        }

        if ("PHC_SUPERVISOR".equals(role)) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(alert.getPhcId())) {
                throw new AccessDeniedException("Access denied: Alert belongs to another PHC");
            }
            return;
        }

        if ("PHARMACIST".equals(role)) {
            boolean isPharmacyAlert = "LOW_MEDICINE_STOCK".equals(alert.getAlertType()) || "EXPIRING_MEDICINE".equals(alert.getAlertType());
            if (!isPharmacyAlert) {
                throw new AccessDeniedException("Access denied: Pharmacists can only acknowledge medicine alerts");
            }
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(alert.getPhcId())) {
                throw new AccessDeniedException("Access denied: Alert belongs to another PHC");
            }
            return;
        }

        if ("ASHA".equals(role)) {
            if (alert.getPatientId() == null) {
                throw new AccessDeniedException("Access denied: ASHA workers can only access patient health alerts");
            }
            Patient p = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + alert.getPatientId(), Patient.class);
            if (p == null) {
                throw new ResourceNotFoundException("Patient not found with ID: " + alert.getPatientId());
            }
            if (!currentUser.getId().equals(p.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
            return;
        }

        throw new AccessDeniedException("Access denied: Insufficient privileges");
    }

    private HealthRiskAlertResponseDTO mapToDTO(HealthRiskAlert alert) {
        HealthRiskAlertResponseDTO dto = new HealthRiskAlertResponseDTO(alert);
        if (alert.getPatientId() != null) {
            try {
                Patient p = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/" + alert.getPatientId(), Patient.class);
                if (p != null) {
                    dto.setPatientName(p.getName());
                }
            } catch (Exception e) {
                // Ignore patient query failure
            }
        }
        return dto;
    }

    public List<com.ashacompanion.dto.HealthAlertDTO> getAlertsForUser(User currentUser, String severityFilter, String alertTypeFilter) {
        List<HealthRiskAlertResponseDTO> dtos = getAlerts(currentUser);
        List<com.ashacompanion.dto.HealthAlertDTO> result = new ArrayList<>();
        for (HealthRiskAlertResponseDTO d : dtos) {
            result.add(new com.ashacompanion.dto.HealthAlertDTO(
                    "ALERT_" + d.getId(),
                    d.getPatientId(),
                    d.getPatientName(),
                    d.getAlertType(),
                    d.getSeverity(),
                    d.getTitle(),
                    d.getMessage(),
                    d.getSeverity()
            ));
        }
        return result.stream()
                .filter(a -> severityFilter == null || severityFilter.trim().isEmpty() || a.getSeverity().equalsIgnoreCase(severityFilter.trim()))
                .filter(a -> alertTypeFilter == null || alertTypeFilter.trim().isEmpty() || a.getAlertType().equalsIgnoreCase(alertTypeFilter.trim()))
                .collect(Collectors.toList());
    }
}
