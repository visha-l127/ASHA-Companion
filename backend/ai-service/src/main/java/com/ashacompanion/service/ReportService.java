package com.ashacompanion.service;

import com.ashacompanion.dto.*;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final RestTemplate restTemplate;

    public ReportService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PatientReportDTO getPatientReport(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Access denied: Pharmacists cannot access clinical patient reports");
        }

        List<Patient> patients;
        if ("ADMIN".equals(role)) {
            Patient[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients", Patient[].class);
            patients = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId != null) {
                Patient[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/phc/" + phcId, Patient[].class);
                patients = arr == null ? Collections.emptyList() : Arrays.asList(arr);
            } else {
                patients = Collections.emptyList();
            }
        } else if ("ASHA".equals(role)) {
            Patient[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/patients/asha/" + currentUser.getId(), Patient[].class);
            patients = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else {
            throw new AccessDeniedException("Access denied: Invalid user role");
        }

        PatientReportDTO report = new PatientReportDTO();
        report.setTotalPatients(patients.size());
        report.setActivePatients(patients.stream().filter(p -> p.isActive()).count());
        report.setMalePatients(patients.stream().filter(p -> p.getGender() != null && "Male".equalsIgnoreCase(p.getGender().trim())).count());
        report.setFemalePatients(patients.stream().filter(p -> p.getGender() != null && "Female".equalsIgnoreCase(p.getGender().trim())).count());
        report.setOtherGenderPatients(patients.stream().filter(p -> p.getGender() != null && !"Male".equalsIgnoreCase(p.getGender().trim()) && !"Female".equalsIgnoreCase(p.getGender().trim())).count());
        report.setPhcId(currentUser.getPhcId());
        report.setAssignedAshaPatientCount("ASHA".equals(role) ? patients.size() : 0);

        return report;
    }

    public MaternalReportDTO getMaternalReport(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Access denied: Pharmacists cannot access maternal reports");
        }

        List<Pregnancy> pregnancies;
        if ("ADMIN".equals(role)) {
            Pregnancy[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies", Pregnancy[].class);
            pregnancies = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId != null) {
                Pregnancy[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/phc/" + phcId, Pregnancy[].class);
                pregnancies = arr == null ? Collections.emptyList() : Arrays.asList(arr);
            } else {
                pregnancies = Collections.emptyList();
            }
        } else if ("ASHA".equals(role)) {
            Pregnancy[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/pregnancies/asha/" + currentUser.getId(), Pregnancy[].class);
            pregnancies = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else {
            throw new AccessDeniedException("Access denied: Invalid user role");
        }

        MaternalReportDTO report = new MaternalReportDTO();
        report.setTotalPregnancies(pregnancies.size());

        long active = 0;
        long delivered = 0;
        long completed = 0;
        long cancelled = 0;
        long highRisk = 0;
        long totalVisits = 0;
        long highRiskVisits = 0;

        for (Pregnancy p : pregnancies) {
            if (p.getPregnancyStatus() == PregnancyStatus.DELIVERED) {
                delivered++;
                completed++;
            } else if (p.getPregnancyStatus() == PregnancyStatus.COMPLETED) {
                completed++;
            } else if (p.getPregnancyStatus() == PregnancyStatus.CANCELLED) {
                cancelled++;
            } else {
                boolean activeFlag = p.isActive();
                if (activeFlag) {
                    active++;
                }
            }

            boolean isHigh = p.isHighRisk();
            if (isHigh || (p.getGravida() != null && p.getGravida() >= 5)) {
                highRisk++;
            }

            AntenatalVisit[] visitsArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/antenatal-visits/pregnancy/" + p.getId(), AntenatalVisit[].class);
            List<AntenatalVisit> visits = visitsArray == null ? Collections.emptyList() : Arrays.asList(visitsArray);
            totalVisits += visits.size();
            highRiskVisits += visits.stream().filter(v -> v.isHighRisk()).count();
        }

        report.setActivePregnancies(active);
        report.setDeliveredPregnancies(delivered);
        report.setCompletedPregnancies(completed);
        report.setCancelledPregnancies(cancelled);
        report.setHighRiskPregnancies(highRisk);
        report.setRecentAncVisitsCount(totalVisits);
        report.setHighRiskAncVisitsCount(highRiskVisits);

        return report;
    }

    public ImmunizationReportDTO getImmunizationReport(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Access denied: Pharmacists cannot access immunization reports");
        }

        List<ImmunizationRecord> records;
        if ("ADMIN".equals(role)) {
            ImmunizationRecord[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations", ImmunizationRecord[].class);
            records = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId != null) {
                ImmunizationRecord[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/phc/" + phcId, ImmunizationRecord[].class);
                records = arr == null ? Collections.emptyList() : Arrays.asList(arr);
            } else {
                records = Collections.emptyList();
            }
        } else if ("ASHA".equals(role)) {
            ImmunizationRecord[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/immunizations/asha/" + currentUser.getId(), ImmunizationRecord[].class);
            records = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else {
            throw new AccessDeniedException("Access denied: Invalid user role");
        }

        ImmunizationReportDTO report = new ImmunizationReportDTO();
        report.setTotalImmunizationRecords(records.size());

        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        long administered = 0;
        long upcoming = 0;
        long overdue = 0;
        Map<String, Long> vaccineWiseCounts = new HashMap<>();

        for (ImmunizationRecord ir : records) {
            boolean administeredFlag = ir.isAdministered();
            if (administeredFlag) {
                administered++;
            } else if (ir.getNextDueDate() != null) {
                if (ir.getNextDueDate().isBefore(today)) {
                    overdue++;
                } else if (!ir.getNextDueDate().isAfter(todayPlus30)) {
                    upcoming++;
                }
            }

            if (ir.getVaccine() != null && ir.getVaccine().getName() != null) {
                String vaccineName = ir.getVaccine().getName();
                vaccineWiseCounts.put(vaccineName, vaccineWiseCounts.getOrDefault(vaccineName, 0L) + 1);
            }
        }

        report.setAdministeredRecords(administered);
        report.setUpcomingVaccinationsCount(upcoming);
        report.setOverdueVaccinationsCount(overdue);
        report.setVaccineWiseCounts(vaccineWiseCounts);

        return report;
    }

    public NutritionReportDTO getNutritionReport(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            throw new AccessDeniedException("Access denied: Pharmacists cannot access nutrition reports");
        }

        List<NutritionRecord> records;
        if ("ADMIN".equals(role)) {
            NutritionRecord[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records", NutritionRecord[].class);
            records = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId != null) {
                NutritionRecord[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/phc/" + phcId, NutritionRecord[].class);
                records = arr == null ? Collections.emptyList() : Arrays.asList(arr);
            } else {
                records = Collections.emptyList();
            }
        } else if ("ASHA".equals(role)) {
            NutritionRecord[] arr = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/asha/" + currentUser.getId(), NutritionRecord[].class);
            records = arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } else {
            throw new AccessDeniedException("Access denied: Invalid user role");
        }

        NutritionReportDTO report = new NutritionReportDTO();
        report.setTotalNutritionRecords(records.size());

        long normal = 0;
        long atRisk = 0;
        long moderateRisk = 0;
        long highRisk = 0;

        for (NutritionRecord nr : records) {
            if (nr.getNutritionStatus() != null) {
                String status = nr.getNutritionStatus().toString();
                if ("NORMAL".equals(status)) {
                    normal++;
                } else if ("AT_RISK".equals(status)) {
                    atRisk++;
                } else if ("MODERATE_RISK".equals(status)) {
                    moderateRisk++;
                } else if ("HIGH_RISK".equals(status)) {
                    highRisk++;
                }
            }
        }

        report.setNormalCount(normal);
        report.setAtRiskCount(atRisk);
        report.setModerateRiskCount(moderateRisk);
        report.setHighRiskCount(highRisk);

        // Count patients whose latest nutrition record is HIGH_RISK
        Set<Long> patientIds = records.stream().map(r -> r.getPatient() != null ? r.getPatient().getId() : 0L).filter(id -> id != 0L).collect(Collectors.toSet());
        long latestHighRisk = 0;
        for (Long pId : patientIds) {
            NutritionRecord[] pNutritionArray = restTemplate.getForObject("http://CLINICAL-SERVICE/internal/nutrition-records/patient/" + pId, NutritionRecord[].class);
            List<NutritionRecord> pNutritionRecords = pNutritionArray == null ? Collections.emptyList() : Arrays.asList(pNutritionArray);
            if (!pNutritionRecords.isEmpty()) {
                NutritionRecord latest = pNutritionRecords.get(0);
                if (latest.getNutritionStatus() != null && "HIGH_RISK".equals(latest.getNutritionStatus().toString())) {
                    latestHighRisk++;
                }
            }
        }
        report.setLatestHighRiskCount(latestHighRisk);

        return report;
    }

    public MedicineReportDTO getMedicineReport(User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        String role = currentUser.getRole();
        if ("ASHA".equals(role)) {
            throw new AccessDeniedException("Access denied: ASHA workers cannot access medicine inventory reports");
        }

        boolean isAdmin = "ADMIN".equals(role);
        String phcId = currentUser.getPhcId();

        Medicine[] medicinesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicines", Medicine[].class);
        List<Medicine> medicines = medicinesArray == null ? Collections.emptyList() : Arrays.asList(medicinesArray);
        
        List<MedicineBatch> batches;
        if (isAdmin) {
            MedicineBatch[] batchesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/batches", MedicineBatch[].class);
            batches = batchesArray == null ? Collections.emptyList() : Arrays.asList(batchesArray);
        } else {
            if (phcId != null) {
                MedicineBatch[] batchesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/batches/phc/" + phcId, MedicineBatch[].class);
                batches = batchesArray == null ? Collections.emptyList() : Arrays.asList(batchesArray);
            } else {
                batches = Collections.emptyList();
            }
        }

        MedicineReportDTO report = new MedicineReportDTO();
        report.setTotalMedicines(medicines.size());
        report.setActiveMedicines(medicines.stream().filter(m -> m.getActiveFlag() == null || m.getActiveFlag() != 0).count());
        report.setTotalBatches(batches.size());

        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        long lowStock = 0;
        long expiredBatches = 0;
        long expiringSoonBatches = 0;
        long totalAvailableQty = 0;

        for (MedicineBatch b : batches) {
            if (b.getExpiryDate() != null) {
                if (b.getExpiryDate().isBefore(today)) {
                    expiredBatches++;
                } else {
                    totalAvailableQty += b.getQuantity() != null ? b.getQuantity() : 0;
                    if (!b.getExpiryDate().isAfter(todayPlus30)) {
                        expiringSoonBatches++;
                    }
                }
            } else {
                totalAvailableQty += b.getQuantity() != null ? b.getQuantity() : 0;
            }
        }

        for (Medicine med : medicines) {
            List<MedicineBatch> medBatches = batches.stream()
                .filter(b -> Objects.equals((b.getMedicine() != null ? b.getMedicine().getId() : null), med.getId()))
                .collect(Collectors.toList());

            int avail = 0;
            for (MedicineBatch b : medBatches) {
                if (b.getExpiryDate() != null && !b.getExpiryDate().isBefore(today)) {
                    avail += b.getQuantity() != null ? b.getQuantity() : 0;
                }
            }
            int reorder = med.getReorderLevel() != null ? med.getReorderLevel() : 0;
            if (avail <= reorder) {
                lowStock++;
            }
        }

        report.setLowStockCount(lowStock);
        report.setExpiredBatchesCount(expiredBatches);
        report.setExpiringSoonBatchesCount(expiringSoonBatches);
        report.setTotalAvailableQuantity(totalAvailableQty);

        return report;
    }
}
