package com.ashacompanion.controller;

import com.ashacompanion.dto.*;
import com.ashacompanion.dto.dashboard.*;
import com.ashacompanion.entity.User;
import com.ashacompanion.service.ClinicalDashboardService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/internal/dashboard")
public class InternalClinicalDashboardController {
    private final ClinicalDashboardService clinicalDashboardService;

    public InternalClinicalDashboardController(ClinicalDashboardService clinicalDashboardService) {
        this.clinicalDashboardService = clinicalDashboardService;
    }

    @PostMapping("/summary")
    public DashboardSummaryDTO getDashboardSummary(@RequestBody User currentUser) {
        return clinicalDashboardService.getDashboardSummary(currentUser);
    }

    @PostMapping("/overview")
    public DashboardOverviewDTO getOverview(@RequestBody User currentUser) {
        return clinicalDashboardService.getOverview(currentUser);
    }

    @PostMapping("/patients")
    public PatientDashboardDTO getPatientSummary(@RequestBody User currentUser) {
        return clinicalDashboardService.getPatientSummary(currentUser);
    }

    @PostMapping("/asha-workers")
    public AshaWorkerDashboardDTO getAshaWorkerSummary(@RequestBody User currentUser) {
        return clinicalDashboardService.getAshaWorkerSummary(currentUser);
    }

    @PostMapping("/maternal")
    public MaternalDashboardDTO getMaternalSummary(@RequestBody User currentUser) {
        return clinicalDashboardService.getMaternalSummary(currentUser);
    }

    @PostMapping("/maternal/high-risk")
    public List<HighRiskPregnancyDTO> getHighRiskPregnancies(@RequestBody User currentUser) {
        return clinicalDashboardService.getHighRiskPregnancies(currentUser);
    }

    @PostMapping("/immunization")
    public ImmunizationDashboardDTO getImmunizationSummary(@RequestBody User currentUser) {
        return clinicalDashboardService.getImmunizationSummary(currentUser);
    }

    @PostMapping("/immunization/overdue")
    public List<ImmunizationResponseDTO> getOverdueImmunizations(@RequestBody User currentUser) {
        return clinicalDashboardService.getOverdueImmunizations(currentUser);
    }

    @PostMapping("/immunization/upcoming")
    public List<ImmunizationResponseDTO> getUpcomingImmunizations(@RequestBody User currentUser) {
        return clinicalDashboardService.getUpcomingImmunizations(currentUser);
    }

    @PostMapping("/nutrition")
    public NutritionDashboardDTO getNutritionSummary(@RequestBody User currentUser) {
        return clinicalDashboardService.getNutritionSummary(currentUser);
    }

    @PostMapping("/nutrition/high-risk")
    public List<HighRiskNutritionDTO> getHighRiskNutrition(@RequestBody User currentUser) {
        return clinicalDashboardService.getHighRiskNutrition(currentUser);
    }

    @PostMapping("/alerts")
    public List<DashboardAlertDTO> getDashboardAlerts(@RequestBody User currentUser) {
        return clinicalDashboardService.getDashboardAlerts(currentUser);
    }


    @PostMapping("/asha")
    public DashboardSummaryDTO getAshaDashboard(@RequestBody User currentAshaUser) {
        return clinicalDashboardService.getAshaDashboard(currentAshaUser);
    }

    @PostMapping("/supervisor")
    public DashboardSummaryDTO getSupervisorDashboard(@RequestBody User currentSupervisorUser) {
        return clinicalDashboardService.getSupervisorDashboard(currentSupervisorUser);
    }

    @PostMapping("/admin")
    public DashboardSummaryDTO getAdminDashboard(@RequestBody User currentAdminUser) {
        return clinicalDashboardService.getAdminDashboard(currentAdminUser);
    }

    @PostMapping("/patient-health-summary/{patientId}")
    public PatientHealthSummaryDTO getPatientHealthSummary(@PathVariable Long patientId, @RequestBody User currentUser) {
        return clinicalDashboardService.getPatientHealthSummary(patientId, currentUser);
    }

}
