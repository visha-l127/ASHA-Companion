package com.ashacompanion.service;

import com.ashacompanion.ai.dto.MedicineForecastResponseDTO;
import com.ashacompanion.ai.dto.MedicineExpiryAIResponseDTO;

import com.ashacompanion.dto.*;
import com.ashacompanion.dto.dashboard.*;
import com.ashacompanion.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class DashboardService {

    private final RestTemplate restTemplate;

    public DashboardService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public DashboardSummaryDTO getDashboardSummary(User currentUser) {
        String role = currentUser.getRole();
        if ("PHARMACIST".equals(role)) {
            DashboardSummaryDTO summary = new DashboardSummaryDTO();
            MedicineDashboardDTO pharmacySummary = getMedicineSummary(currentUser);
            if (pharmacySummary != null) {
                summary.setLowStockMedicineCount(pharmacySummary.getLowStockMedicineCount());
                summary.setExpiringMedicineBatchCount(pharmacySummary.getExpiringBatchCount());
            }
            summary.setTotalPatients(0L);
            summary.setActivePatients(0L);
            summary.setChildrenCount(0L);
            summary.setTotalPregnancies(0L);
            summary.setActivePregnancies(0L);
            summary.setHighRiskPregnancies(0L);
            summary.setPendingANCVisits(0L);
            summary.setOverdueANCVisits(0L);
            summary.setImmunizationsDue(0L);
            summary.setImmunizationsOverdue(0L);
            summary.setNutritionAtRiskCount(0L);
            summary.setNutritionHighRiskCount(0L);
            summary.setTotalAlerts(0L);
            return summary;
        } else {
            DashboardSummaryDTO summary = restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/summary", currentUser, DashboardSummaryDTO.class);
            if (summary == null) {
                summary = new DashboardSummaryDTO();
            }
            if ("ADMIN".equals(role) || "PHC_SUPERVISOR".equals(role)) {
                MedicineDashboardDTO pharmacySummary = getMedicineSummary(currentUser);
                if (pharmacySummary != null) {
                    summary.setLowStockMedicineCount(pharmacySummary.getLowStockMedicineCount());
                    summary.setExpiringMedicineBatchCount(pharmacySummary.getExpiringBatchCount());
                }
            }
            return summary;
        }
    }

    public DashboardOverviewDTO getOverview(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/overview", currentUser, DashboardOverviewDTO.class);
    }

    public PatientDashboardDTO getPatientSummary(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/patients", currentUser, PatientDashboardDTO.class);
    }

    public AshaWorkerDashboardDTO getAshaWorkerSummary(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/asha-workers", currentUser, AshaWorkerDashboardDTO.class);
    }

    public MaternalDashboardDTO getMaternalSummary(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/maternal", currentUser, MaternalDashboardDTO.class);
    }

    @SuppressWarnings("unchecked")
    public List<HighRiskPregnancyDTO> getHighRiskPregnancies(User currentUser) {
        HighRiskPregnancyDTO[] res = restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/maternal/high-risk", currentUser, HighRiskPregnancyDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    public ImmunizationDashboardDTO getImmunizationSummary(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/immunization", currentUser, ImmunizationDashboardDTO.class);
    }

    @SuppressWarnings("unchecked")
    public List<ImmunizationResponseDTO> getOverdueImmunizations(User currentUser) {
        ImmunizationResponseDTO[] res = restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/immunization/overdue", currentUser, ImmunizationResponseDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    @SuppressWarnings("unchecked")
    public List<ImmunizationResponseDTO> getUpcomingImmunizations(User currentUser) {
        ImmunizationResponseDTO[] res = restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/immunization/upcoming", currentUser, ImmunizationResponseDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    public NutritionDashboardDTO getNutritionSummary(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/nutrition", currentUser, NutritionDashboardDTO.class);
    }

    @SuppressWarnings("unchecked")
    public List<HighRiskNutritionDTO> getHighRiskNutrition(User currentUser) {
        HighRiskNutritionDTO[] res = restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/nutrition/high-risk", currentUser, HighRiskNutritionDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    public MedicineDashboardDTO getMedicineSummary(User currentUser) {
        return restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/pharmacy/summary", currentUser, MedicineDashboardDTO.class);
    }

    @SuppressWarnings("unchecked")
    public List<MedicineForecastResponseDTO> getInventoryForecastAlerts(User currentUser) {
        MedicineForecastResponseDTO[] res = restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/pharmacy/forecast-alerts", currentUser, MedicineForecastResponseDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    @SuppressWarnings("unchecked")
    public List<MedicineExpiryAIResponseDTO> getRecentExpiryAlerts(User currentUser) {
        MedicineExpiryAIResponseDTO[] res = restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/pharmacy/expiry-alerts", currentUser, MedicineExpiryAIResponseDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    @SuppressWarnings("unchecked")
    public List<MedicineTransactionResponseDTO> getRecentTransactions(User currentUser) {
        MedicineTransactionResponseDTO[] res = restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/pharmacy/transactions", currentUser, MedicineTransactionResponseDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    @SuppressWarnings("unchecked")
    public List<DashboardAlertDTO> getDashboardAlerts(User currentUser) {
        DashboardAlertDTO[] clinAlerts = restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/alerts", currentUser, DashboardAlertDTO[].class);
        DashboardAlertDTO[] pharmAlerts = restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/alerts", currentUser, DashboardAlertDTO[].class);
        
        List<DashboardAlertDTO> all = new ArrayList<>();
        if (clinAlerts != null) all.addAll(Arrays.asList(clinAlerts));
        if (pharmAlerts != null) all.addAll(Arrays.asList(pharmAlerts));
        return all;
    }


    @SuppressWarnings("unchecked")
    public List<MedicineBatchResponseDTO> getExpiredMedicineBatches(User currentUser) {
        MedicineBatchResponseDTO[] res = restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/pharmacy/expired", currentUser, MedicineBatchResponseDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    public DashboardSummaryDTO getAshaDashboard(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/asha", currentUser, DashboardSummaryDTO.class);
    }

    public DashboardSummaryDTO getSupervisorDashboard(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/supervisor", currentUser, DashboardSummaryDTO.class);
    }

    public DashboardSummaryDTO getAdminDashboard(User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/admin", currentUser, DashboardSummaryDTO.class);
    }

    public PatientHealthSummaryDTO getPatientHealthSummary(Long patientId, User currentUser) {
        return restTemplate.postForObject("http://CLINICAL-SERVICE/internal/dashboard/patient-health-summary/" + patientId, currentUser, PatientHealthSummaryDTO.class);
    }


    @SuppressWarnings("unchecked")
    public List<MedicineStockSummaryDTO> getLowStockMedicines(User currentUser) {
        MedicineStockSummaryDTO[] res = restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/pharmacy/low-stock", currentUser, MedicineStockSummaryDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

    @SuppressWarnings("unchecked")
    public List<MedicineBatchResponseDTO> getExpiringMedicineBatches(User currentUser) {
        MedicineBatchResponseDTO[] res = restTemplate.postForObject("http://PHARMACY-SERVICE/internal/dashboard/pharmacy/expiring", currentUser, MedicineBatchResponseDTO[].class);
        return res == null ? Collections.emptyList() : Arrays.asList(res);
    }

}