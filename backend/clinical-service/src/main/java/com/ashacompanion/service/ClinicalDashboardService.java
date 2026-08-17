package com.ashacompanion.service;

import com.ashacompanion.dto.*;
import com.ashacompanion.dto.dashboard.*;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClinicalDashboardService {

    private final PatientRepository patientRepository;
    private final PregnancyRepository pregnancyRepository;
    private final AntenatalVisitRepository antenatalVisitRepository;
    private final ImmunizationRecordRepository immunizationRecordRepository;
    private final NutritionRecordRepository nutritionRecordRepository;
    
    
    private final UserRepository userRepository;
    
    

    public ClinicalDashboardService(PatientRepository patientRepository,
                                    PregnancyRepository pregnancyRepository,
                                    AntenatalVisitRepository antenatalVisitRepository,
                                    ImmunizationRecordRepository immunizationRecordRepository,
                                    NutritionRecordRepository nutritionRecordRepository,
                                    UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.pregnancyRepository = pregnancyRepository;
        this.antenatalVisitRepository = antenatalVisitRepository;
        this.immunizationRecordRepository = immunizationRecordRepository;
        this.nutritionRecordRepository = nutritionRecordRepository;
        this.userRepository = userRepository;
    }

    private void verifySupervisorOrAdmin(User currentUser) {
        String role = currentUser.getRole();
        if (!"ADMIN".equals(role) && !"PHC_SUPERVISOR".equals(role)) {
            throw new AccessDeniedException("Access denied: Only PHC Supervisors and Admins can access this dashboard endpoint");
        }
    }

    // =========================================================================
    // PHASE 10 DASHBOARD ENDPOINTS
    // =========================================================================

    public DashboardOverviewDTO getOverview(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        DashboardOverviewDTO overview = new DashboardOverviewDTO();
        overview.setPhcId(isAdmin ? "GLOBAL" : phcId);

        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        List<Patient> patients = isAdmin ? patientRepository.findAll() : (phcId != null ? patientRepository.findByPhcId(phcId) : Collections.emptyList());
        overview.setTotalPatients(patients.size());
        overview.setActivePatients(patients.stream().filter(Patient::isActive).count());

        List<User> ashaWorkers = isAdmin ? userRepository.findByRole("ASHA") : (phcId != null ? userRepository.findByRoleAndPhcId("ASHA", phcId) : Collections.emptyList());
        overview.setTotalAshaWorkers(ashaWorkers.size());

        List<Pregnancy> pregnancies = isAdmin ? pregnancyRepository.findAll() : (phcId != null ? pregnancyRepository.findByPatientPhcId(phcId) : Collections.emptyList());
        long activePreg = 0;
        long highRiskPreg = 0;
        long ancVisitCount = 0;

        for (Pregnancy p : pregnancies) {
            if (p.isActive() && p.getPregnancyStatus() != PregnancyStatus.DELIVERED && p.getPregnancyStatus() != PregnancyStatus.CANCELLED) {
                activePreg++;
                if (p.isHighRisk() || (p.getGravida() != null && p.getGravida() >= 5)) {
                    highRiskPreg++;
                }
            }
            List<AntenatalVisit> visits = antenatalVisitRepository.findByPregnancyId(p.getId());
            ancVisitCount += visits.size();
        }
        overview.setActivePregnancies(activePreg);
        overview.setHighRiskPregnancies(highRiskPreg);
        overview.setTotalAntenatalVisits(ancVisitCount);

        List<ImmunizationRecord> immunizations = isAdmin ? immunizationRecordRepository.findAll() : (phcId != null ? immunizationRecordRepository.findByPatientPhcId(phcId) : Collections.emptyList());
        Set<Long> childIds = immunizations.stream().map(ir -> ir.getPatient().getId()).collect(Collectors.toSet());
        overview.setChildrenWithImmunizationRecords(childIds.size());

        long upcomingImm = 0;
        long overdueImm = 0;
        for (ImmunizationRecord ir : immunizations) {
            if (!ir.isAdministered() && ir.getNextDueDate() != null) {
                if (ir.getNextDueDate().isBefore(today)) {
                    overdueImm++;
                } else if (!ir.getNextDueDate().isAfter(todayPlus30)) {
                    upcomingImm++;
                }
            }
        }
        overview.setUpcomingVaccinations(upcomingImm);
        overview.setOverdueVaccinations(overdueImm);

        List<NutritionRecord> nutritionRecords = isAdmin ? nutritionRecordRepository.findAll() : (phcId != null ? nutritionRecordRepository.findByPatientPhcId(phcId) : Collections.emptyList());
        long highRiskNut = nutritionRecords.stream().filter(n -> n.getNutritionStatus() == NutritionStatus.HIGH_RISK).count();
        overview.setHighRiskNutritionRecords(highRiskNut);

        // Pharmacy (delegated to Pharmacy service)
        overview.setLowStockMedicines(0L);
        overview.setExpiringMedicineBatches(0);

        return overview;
    }

    public PatientDashboardDTO getPatientSummary(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        List<Patient> patients = isAdmin ? patientRepository.findAll() : (phcId != null ? patientRepository.findByPhcId(phcId) : Collections.emptyList());
        long total = patients.size();
        long active = patients.stream().filter(Patient::isActive).count();
        long inactive = total - active;

        return new PatientDashboardDTO(total, active, inactive);
    }

    public AshaWorkerDashboardDTO getAshaWorkerSummary(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        List<User> ashaUsers = isAdmin ? userRepository.findByRole("ASHA") : (phcId != null ? userRepository.findByRoleAndPhcId("ASHA", phcId) : Collections.emptyList());

        List<AshaWorkerSummaryDTO> workerDTOs = new ArrayList<>();
        for (User asha : ashaUsers) {
            long pCount = patientRepository.findByAshaWorkerId(asha.getId()).size();
            workerDTOs.add(new AshaWorkerSummaryDTO(
                    asha.getId(),
                    asha.getName(),
                    asha.getUsername(),
                    asha.getPhcId(),
                    pCount
            ));
        }

        return new AshaWorkerDashboardDTO(workerDTOs.size(), workerDTOs);
    }

    public MaternalDashboardDTO getMaternalSummary(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        List<Pregnancy> pregnancies = isAdmin ? pregnancyRepository.findAll() : (phcId != null ? pregnancyRepository.findByPatientPhcId(phcId) : Collections.emptyList());

        long total = pregnancies.size();
        long active = 0;
        long highRisk = 0;
        long delivered = 0;
        long completed = 0;

        for (Pregnancy p : pregnancies) {
            if (p.getPregnancyStatus() == PregnancyStatus.DELIVERED) {
                delivered++;
                completed++;
            } else if (p.getPregnancyStatus() == PregnancyStatus.COMPLETED) {
                completed++;
            }

            if (p.isActive() && p.getPregnancyStatus() != PregnancyStatus.DELIVERED && p.getPregnancyStatus() != PregnancyStatus.CANCELLED) {
                active++;
                if (p.isHighRisk() || (p.getGravida() != null && p.getGravida() >= 5)) {
                    highRisk++;
                }
            }
        }

        return new MaternalDashboardDTO(total, active, highRisk, delivered, completed);
    }

    public List<HighRiskPregnancyDTO> getHighRiskPregnancies(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        List<Pregnancy> pregnancies = isAdmin ? pregnancyRepository.findAll() : (phcId != null ? pregnancyRepository.findByPatientPhcId(phcId) : Collections.emptyList());

        List<HighRiskPregnancyDTO> dtos = new ArrayList<>();
        for (Pregnancy p : pregnancies) {
            if (!p.isActive() || p.getPregnancyStatus() == PregnancyStatus.DELIVERED || p.getPregnancyStatus() == PregnancyStatus.CANCELLED) {
                continue;
            }

            if (p.isHighRisk() || (p.getGravida() != null && p.getGravida() >= 5)) {
                HighRiskPregnancyDTO dto = new HighRiskPregnancyDTO();
                dto.setPregnancyId(p.getId());
                dto.setPatientId(p.getPatient().getId());
                dto.setPatientName(p.getPatient().getName());
                dto.setPhcId(p.getPatient().getPhcId());
                dto.setExpectedDeliveryDate(p.getExpectedDeliveryDate());
                dto.setPregnancyStatus(p.getPregnancyStatus().name());
                dto.setRiskFactors(p.getRiskFactors());

                List<AntenatalVisit> visits = antenatalVisitRepository.findByPregnancyId(p.getId());
                LocalDate lastVisit = null;
                for (AntenatalVisit v : visits) {
                    if (v.isActive() && v.getVisitDate() != null) {
                        if (lastVisit == null || v.getVisitDate().isAfter(lastVisit)) {
                            lastVisit = v.getVisitDate();
                        }
                    }
                }
                dto.setLastAncVisitDate(lastVisit);
                dtos.add(dto);
            }
        }
        return dtos;
    }

    public ImmunizationDashboardDTO getImmunizationSummary(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        List<ImmunizationRecord> records = isAdmin ? immunizationRecordRepository.findAll() : (phcId != null ? immunizationRecordRepository.findByPatientPhcId(phcId) : Collections.emptyList());

        long total = records.size();
        long upcoming = 0;
        long overdue = 0;
        long administered = 0;

        for (ImmunizationRecord ir : records) {
            if (ir.isAdministered()) {
                administered++;
            } else if (ir.getNextDueDate() != null) {
                if (ir.getNextDueDate().isBefore(today)) {
                    overdue++;
                } else if (!ir.getNextDueDate().isAfter(todayPlus30)) {
                    upcoming++;
                }
            }
        }

        return new ImmunizationDashboardDTO(total, upcoming, overdue, administered);
    }

    public List<ImmunizationResponseDTO> getOverdueImmunizations(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();
        LocalDate today = LocalDate.now();

        List<ImmunizationRecord> records = isAdmin ?
                immunizationRecordRepository.findByAdministeredAndNextDueDateBefore(0, today) :
                (phcId != null ? immunizationRecordRepository.findByAdministeredAndNextDueDateBeforeAndPatientPhcId(0, today, phcId) : Collections.emptyList());

        return records.stream().map(ImmunizationResponseDTO::new).collect(Collectors.toList());
    }

    public List<ImmunizationResponseDTO> getUpcomingImmunizations(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();
        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        List<ImmunizationRecord> records = isAdmin ?
                immunizationRecordRepository.findByAdministeredAndNextDueDateBetween(0, today, todayPlus30) :
                (phcId != null ? immunizationRecordRepository.findByAdministeredAndNextDueDateBetweenAndPatientPhcId(0, today, todayPlus30, phcId) : Collections.emptyList());

        return records.stream().map(ImmunizationResponseDTO::new).collect(Collectors.toList());
    }

    public NutritionDashboardDTO getNutritionSummary(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        List<NutritionRecord> records = isAdmin ? nutritionRecordRepository.findAll() : (phcId != null ? nutritionRecordRepository.findByPatientPhcId(phcId) : Collections.emptyList());

        long total = records.size();
        long normal = 0;
        long atRisk = 0;
        long modRisk = 0;
        long highRisk = 0;

        for (NutritionRecord nr : records) {
            if (nr.getNutritionStatus() == NutritionStatus.NORMAL) normal++;
            else if (nr.getNutritionStatus() == NutritionStatus.AT_RISK) atRisk++;
            else if (nr.getNutritionStatus() == NutritionStatus.MODERATE_RISK) modRisk++;
            else if (nr.getNutritionStatus() == NutritionStatus.HIGH_RISK) highRisk++;
        }

        List<Patient> patients = isAdmin ? patientRepository.findAll() : (phcId != null ? patientRepository.findByPhcId(phcId) : Collections.emptyList());
        long totalHighRiskChildren = 0;
        for (Patient p : patients) {
            Optional<NutritionRecord> latestOpt = nutritionRecordRepository.findFirstByPatientIdOrderByMeasurementDateDesc(p.getId());
            if (latestOpt.isPresent() && latestOpt.get().getNutritionStatus() == NutritionStatus.HIGH_RISK) {
                totalHighRiskChildren++;
            }
        }

        return new NutritionDashboardDTO(total, normal, atRisk, modRisk, highRisk, totalHighRiskChildren);
    }

    public List<HighRiskNutritionDTO> getHighRiskNutrition(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();

        List<NutritionRecord> records = isAdmin ? nutritionRecordRepository.findAll() : (phcId != null ? nutritionRecordRepository.findByPatientPhcId(phcId) : Collections.emptyList());

        List<HighRiskNutritionDTO> dtos = new ArrayList<>();
        for (NutritionRecord nr : records) {
            if (nr.getNutritionStatus() == NutritionStatus.HIGH_RISK) {
                HighRiskNutritionDTO dto = new HighRiskNutritionDTO();
                dto.setRecordId(nr.getId());
                dto.setPatientId(nr.getPatient().getId());
                dto.setPatientName(nr.getPatient().getName());
                dto.setMeasurementDate(nr.getMeasurementDate());
                dto.setAgeMonths(nr.getAgeMonths());
                dto.setWeightKg(nr.getWeightKg());
                dto.setHeightCm(nr.getHeightCm());
                dto.setMuacCm(nr.getMuacCm());
                dto.setNutritionStatus(nr.getNutritionStatus().name());
                dto.setRiskFactors(nr.getRiskFactors());
                dto.setRecordedByUserId(nr.getRecordedByUserId());
                dtos.add(dto);
            }
        }
        return dtos;
    }

    // =========================================================================
    // PRESERVED PHASE 9 ENDPOINTS
    // =========================================================================

    public DashboardSummaryDTO getAshaDashboard(User currentAshaUser) {
        if (!"ASHA".equals(currentAshaUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only ASHA workers can access ASHA dashboard");
        }

        List<Patient> patients = patientRepository.findByAshaWorkerId(currentAshaUser.getId());
        return computeDashboardSummary(patients, currentAshaUser);
    }

    public DashboardSummaryDTO getSupervisorDashboard(User currentSupervisorUser) {
        if (!"PHC_SUPERVISOR".equals(currentSupervisorUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only PHC Supervisors can access Supervisor dashboard");
        }
        String phcId = currentSupervisorUser.getPhcId();
        if (phcId == null || phcId.trim().isEmpty()) {
            throw new AccessDeniedException("Access denied: Supervisor has no assigned PHC");
        }

        List<Patient> patients = patientRepository.findByPhcId(phcId);
        return computeDashboardSummary(patients, currentSupervisorUser);
    }

    public DashboardSummaryDTO getAdminDashboard(User currentAdminUser) {
        if (!"ADMIN".equals(currentAdminUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only Admins can access Admin dashboard");
        }

        List<Patient> patients = patientRepository.findAll();
        return computeDashboardSummary(patients, currentAdminUser);
    }

    private DashboardSummaryDTO computeDashboardSummary(List<Patient> patients, User user) {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        LocalDate today = LocalDate.now();
        LocalDate todayPlus30 = today.plusDays(30);

        long totalPatients = patients.size();
        long activePatients = patients.stream().filter(Patient::isActive).count();
        long childrenCount = patients.stream()
                .filter(Patient::isActive)
                .filter(p -> p.getDateOfBirth() != null && p.getDateOfBirth().isAfter(today.minusYears(5)))
                .count();

        long totalPregnancies = 0;
        long activePregnancies = 0;
        long highRiskPregnancies = 0;
        long pendingANCVisits = 0;
        long overdueANCVisits = 0;
        long immunizationsDue = 0;
        long immunizationsOverdue = 0;
        long nutritionAtRiskCount = 0;
        long nutritionHighRiskCount = 0;

        for (Patient patient : patients) {
            if (!patient.isActive()) {
                continue;
            }

            // Pregnancies & ANC
            List<Pregnancy> pregnancies = pregnancyRepository.findByPatientId(patient.getId());
            totalPregnancies += pregnancies.size();

            for (Pregnancy p : pregnancies) {
                if (p.isActive() && p.getPregnancyStatus() != PregnancyStatus.DELIVERED && p.getPregnancyStatus() != PregnancyStatus.CANCELLED) {
                    activePregnancies++;
                    if (p.isHighRisk() || (p.getGravida() != null && p.getGravida() >= 5)) {
                        highRiskPregnancies++;
                    }

                    List<AntenatalVisit> visits = antenatalVisitRepository.findByPregnancyId(p.getId());
                    for (AntenatalVisit v : visits) {
                        if (v.isActive() && v.getNextVisitDate() != null) {
                            if (!v.getNextVisitDate().isBefore(today)) {
                                pendingANCVisits++;
                            } else {
                                overdueANCVisits++;
                            }
                        }
                    }
                }
            }

            // Immunizations
            List<ImmunizationRecord> immunizations = immunizationRecordRepository.findByPatientId(patient.getId());
            for (ImmunizationRecord ir : immunizations) {
                if (!ir.isAdministered() && ir.getNextDueDate() != null) {
                    LocalDate dueDate = ir.getNextDueDate();
                    if (dueDate.isBefore(today)) {
                        immunizationsOverdue++;
                    } else if (!dueDate.isAfter(todayPlus30)) {
                        immunizationsDue++;
                    }
                }
            }

            // Nutrition
            Optional<NutritionRecord> latestNutOpt = nutritionRecordRepository.findFirstByPatientIdOrderByMeasurementDateDesc(patient.getId());
            if (latestNutOpt.isPresent()) {
                NutritionRecord nut = latestNutOpt.get();
                if (nut.getNutritionStatus() == NutritionStatus.HIGH_RISK) {
                    nutritionHighRiskCount++;
                    nutritionAtRiskCount++;
                } else if (nut.getNutritionStatus() == NutritionStatus.MODERATE_RISK || nut.getNutritionStatus() == NutritionStatus.AT_RISK) {
                    nutritionAtRiskCount++;
                }
            }
        }

        summary.setTotalPatients(totalPatients);
        summary.setActivePatients(activePatients);
        summary.setChildrenCount(childrenCount);
        summary.setTotalPregnancies(totalPregnancies);
        summary.setActivePregnancies(activePregnancies);
        summary.setHighRiskPregnancies(highRiskPregnancies);
        summary.setPendingANCVisits(pendingANCVisits);
        summary.setOverdueANCVisits(overdueANCVisits);
        summary.setImmunizationsDue(immunizationsDue);
        summary.setImmunizationsOverdue(immunizationsOverdue);
        summary.setNutritionAtRiskCount(nutritionAtRiskCount);
        summary.setNutritionHighRiskCount(nutritionHighRiskCount);

        // Pharmacy stock counts for Supervisor & Admin (delegated to Pharmacy service)
        summary.setLowStockMedicineCount(0L);
        summary.setExpiringMedicineBatchCount(0L);

        // Alerts count (delegated to AI-SERVICE)
        summary.setTotalAlerts(0L);

        return summary;
    }

    public PatientHealthSummaryDTO getPatientHealthSummary(Long patientId, User currentUser) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        String role = currentUser.getRole();
        if ("ADMIN".equals(role)) {
            // Global access
        } else if ("PHC_SUPERVISOR".equals(role)) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(patient.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient does not belong to your PHC");
            }
        } else if ("ASHA".equals(role)) {
            if (currentUser.getId() == null || !currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is not assigned to you");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient permissions to view patient health summary");
        }

        PatientHealthSummaryDTO summary = new PatientHealthSummaryDTO();
        summary.setPatientId(patient.getId());
        summary.setPatientName(patient.getName());
        summary.setGender(patient.getGender());
        summary.setDateOfBirth(patient.getDateOfBirth());
        summary.setPhcId(patient.getPhcId());
        summary.setAshaWorkerId(patient.getAshaWorkerId());

        LocalDate today = LocalDate.now();

        // 1. Pregnancy Summary
        List<Pregnancy> pregnancies = pregnancyRepository.findByPatientId(patient.getId());
        Pregnancy activePregnancy = null;
        for (Pregnancy p : pregnancies) {
            if (p.isActive() && p.getPregnancyStatus() != PregnancyStatus.DELIVERED && p.getPregnancyStatus() != PregnancyStatus.CANCELLED) {
                activePregnancy = p;
                break;
            }
        }

        if (activePregnancy != null) {
            summary.setHasActivePregnancy(true);
            summary.setPregnancyStatus(activePregnancy.getPregnancyStatus().name());
            summary.setExpectedDeliveryDate(activePregnancy.getExpectedDeliveryDate());
            summary.setHighRiskPregnancy(activePregnancy.isHighRisk() || (activePregnancy.getGravida() != null && activePregnancy.getGravida() >= 5));
            summary.setPregnancyRiskFactors(activePregnancy.getRiskFactors());

            List<AntenatalVisit> visits = antenatalVisitRepository.findByPregnancyId(activePregnancy.getId());
            summary.setTotalANCVisits(visits.size());

            LocalDate lastVisitDate = null;
            LocalDate nextVisitDate = null;
            for (AntenatalVisit v : visits) {
                if (v.isActive()) {
                    if (v.getVisitDate() != null && (lastVisitDate == null || v.getVisitDate().isAfter(lastVisitDate))) {
                        lastVisitDate = v.getVisitDate();
                    }
                    if (v.getNextVisitDate() != null && (nextVisitDate == null || v.getNextVisitDate().isAfter(nextVisitDate))) {
                        nextVisitDate = v.getNextVisitDate();
                    }
                }
            }
            summary.setLastANCVisitDate(lastVisitDate);
            summary.setNextANCVisitDate(nextVisitDate);
            summary.setOverdueANC(nextVisitDate != null && nextVisitDate.isBefore(today));
        } else {
            summary.setHasActivePregnancy(false);
            summary.setTotalANCVisits(0);
            summary.setOverdueANC(false);
        }

        // 3. Immunization Summary
        List<ImmunizationRecord> immunizations = immunizationRecordRepository.findByPatientId(patient.getId());
        summary.setTotalImmunizations(immunizations.size());

        int upcoming = 0;
        int overdue = 0;
        for (ImmunizationRecord ir : immunizations) {
            if (!ir.isAdministered() && ir.getNextDueDate() != null) {
                if (ir.getNextDueDate().isBefore(today)) {
                    overdue++;
                } else if (!ir.getNextDueDate().isAfter(today.plusDays(30))) {
                    upcoming++;
                }
            }
        }
        summary.setUpcomingImmunizations(upcoming);
        summary.setOverdueImmunizations(overdue);

        // 4. Nutrition Summary
        Optional<NutritionRecord> latestNutOpt = nutritionRecordRepository.findFirstByPatientIdOrderByMeasurementDateDesc(patient.getId());
        if (latestNutOpt.isPresent()) {
            NutritionRecord nut = latestNutOpt.get();
            summary.setLatestNutritionStatus(nut.getNutritionStatus().name());
            summary.setLatestNutritionDate(nut.getMeasurementDate());
            summary.setNutritionRisk(nut.isRiskFlag());
            summary.setNutritionRiskFactors(nut.getRiskFactors());
        } else {
            summary.setNutritionRisk(false);
        }

        return summary;
    }

    public DashboardSummaryDTO getDashboardSummary(User currentUser) {
        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Not authenticated");
        }
        String role = currentUser.getRole();
        if ("ASHA".equals(role)) {
            return getAshaDashboard(currentUser);
        } else if ("PHC_SUPERVISOR".equals(role)) {
            return getSupervisorDashboard(currentUser);
        } else if ("ADMIN".equals(role)) {
            return getAdminDashboard(currentUser);
        } else {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Invalid user role");
        }
    }


    public List<DashboardAlertDTO> getDashboardAlerts(User currentUser) {
        verifySupervisorOrAdmin(currentUser);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        String phcId = currentUser.getPhcId();
        LocalDate today = LocalDate.now();

        List<DashboardAlertDTO> alerts = new ArrayList<>();

        // High Risk Pregnancies
        List<Pregnancy> pregnancies = isAdmin ? pregnancyRepository.findAll() : (phcId != null ? pregnancyRepository.findByPatientPhcId(phcId) : Collections.emptyList());
        for (Pregnancy p : pregnancies) {
            if (p.isActive() && p.getPregnancyStatus() != PregnancyStatus.DELIVERED && p.getPregnancyStatus() != PregnancyStatus.CANCELLED) {
                if (p.isHighRisk() || (p.getGravida() != null && p.getGravida() >= 5)) {
                    alerts.add(new DashboardAlertDTO(
                            "HIGH_RISK_PREGNANCY",
                            "HIGH",
                            p.getId(),
                            "High-risk pregnancy requires monitoring",
                            p.getPatient().getId(),
                            p.getPatient().getName(),
                            p.getPatient().getPhcId()
                    ));
                }
            }
        }

        // Overdue Immunizations
        List<ImmunizationRecord> immunizations = isAdmin ?
                immunizationRecordRepository.findByAdministeredAndNextDueDateBefore(0, today) :
                (phcId != null ? immunizationRecordRepository.findByAdministeredAndNextDueDateBeforeAndPatientPhcId(0, today, phcId) : Collections.emptyList());
        for (ImmunizationRecord ir : immunizations) {
            alerts.add(new DashboardAlertDTO(
                    "OVERDUE_IMMUNIZATION",
                    "HIGH",
                    ir.getId(),
                    "Immunization overdue for patient",
                    ir.getPatient().getId(),
                    ir.getPatient().getName(),
                    ir.getPatient().getPhcId()
            ));
        }

        // High Risk Nutrition
        List<NutritionRecord> nutritionRecords = isAdmin ? nutritionRecordRepository.findAll() : (phcId != null ? nutritionRecordRepository.findByPatientPhcId(phcId) : Collections.emptyList());
        for (NutritionRecord nr : nutritionRecords) {
            if (nr.getNutritionStatus() == NutritionStatus.HIGH_RISK) {
                alerts.add(new DashboardAlertDTO(
                        "HIGH_RISK_NUTRITION",
                        "HIGH",
                        nr.getId(),
                        "Child evaluated as high risk for malnutrition",
                        nr.getPatient().getId(),
                        nr.getPatient().getName(),
                        nr.getPatient().getPhcId()
                ));
            }
        }

        return alerts;
    }

}
