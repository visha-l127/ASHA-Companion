package com.ashacompanion.service;

import com.ashacompanion.dto.MedicineDemandForecastRequestDTO;
import com.ashacompanion.dto.MedicineDemandForecastResponseDTO;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.MedicineDemandForecastRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MedicineForecastService {

    private final MedicineDemandForecastRepository forecastRepository;
    private final RestTemplate restTemplate;

    public MedicineForecastService(MedicineDemandForecastRepository forecastRepository,
                                   RestTemplate restTemplate) {
        this.forecastRepository = forecastRepository;
        this.restTemplate = restTemplate;
    }

    public void checkForecastAccess(User currentUser) {
        String role = currentUser.getRole();
        if ("ASHA".equals(role)) {
            throw new AccessDeniedException("Access denied: ASHA workers cannot access or generate medicine demand forecasts");
        }
    }

    @Transactional
    public MedicineDemandForecastResponseDTO generateForecast(MedicineDemandForecastRequestDTO request, User currentUser) {
        checkForecastAccess(currentUser);

        Medicine medicine = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicines/id/" + request.getMedicineId(), Medicine.class);
        if (medicine == null) {
            throw new ResourceNotFoundException("Medicine not found with ID: " + request.getMedicineId());
        }

        String role = currentUser.getRole();
        String phcId = request.getPhcId();

        if ("PHC_SUPERVISOR".equals(role) || "PHARMACIST".equals(role)) {
            if (currentUser.getPhcId() == null || currentUser.getPhcId().trim().isEmpty()) {
                throw new AccessDeniedException("Access denied: User does not belong to any PHC");
            }
            phcId = currentUser.getPhcId(); // Force own PHC
        } else if ("ADMIN".equals(role)) {
            if (phcId == null || phcId.trim().isEmpty()) {
                phcId = "GLOBAL";
            }
        }

        int forecastDays = request.getForecastDays() != null && request.getForecastDays() > 0 ? request.getForecastDays() : 30;

        // 1. Calculate Current Available Non-Expired Stock
        LocalDate today = LocalDate.now();
        MedicineBatch[] batchesArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicine-batches/medicine/" + medicine.getId() + "/active", MedicineBatch[].class);
        List<MedicineBatch> batches = batchesArray == null ? Collections.emptyList() : Arrays.asList(batchesArray);
        
        if (!"GLOBAL".equals(phcId)) {
            String targetPhc = phcId;
            batches = batches.stream().filter(b -> targetPhc.equals(b.getPhcId())).collect(Collectors.toList());
        }

        int currentStock = batches.stream()
                .filter(b -> b.getExpiryDate() != null && !b.getExpiryDate().isBefore(today))
                .mapToInt(b -> b.getQuantity() != null ? b.getQuantity() : 0)
                .sum();

        // 2. Retrieve Historical DISPENSED Transactions
        MedicineTransaction[] txArray = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/transactions", MedicineTransaction[].class);
        List<MedicineTransaction> transactions = txArray == null ? Collections.emptyList() : Arrays.asList(txArray);
        
        transactions = transactions.stream()
                .filter(t -> Objects.equals((t.getBatch() != null && t.getBatch().getMedicine() != null ? t.getBatch().getMedicine().getId() : null), medicine.getId()) && "DISPENSED".equalsIgnoreCase(t.getTransactionType()))
                .collect(Collectors.toList());
                
        if (!"GLOBAL".equals(phcId)) {
            String targetPhc = phcId;
            transactions = transactions.stream()
                    .filter(t -> targetPhc.equals(t.getPhcId()))
                    .collect(Collectors.toList());
        }

        int totalDispensed = transactions.stream().mapToInt(t -> t.getQuantity() != null ? t.getQuantity() : 0).sum();

        double averageDailyDemand;
        if (!transactions.isEmpty()) {
            LocalDateTime minTime = transactions.stream()
                    .map(MedicineTransaction::getTransactionTime)
                    .filter(Objects::nonNull)
                    .min(LocalDateTime::compareTo)
                    .orElse(LocalDateTime.now().minusDays(30));
            long days = ChronoUnit.DAYS.between(minTime, LocalDateTime.now());
            days = Math.max(1, days);
            averageDailyDemand = (double) totalDispensed / days;
        } else {
            // Default baseline heuristic if no transaction history exists
            int reorder = medicine.getReorderLevel() != null ? medicine.getReorderLevel() : 0;
            averageDailyDemand = Math.max(1.0, (double) reorder / 10.0);
        }

        int predictedDemand = (int) Math.ceil(averageDailyDemand * forecastDays);
        int safetyBuffer = (int) Math.ceil(predictedDemand * 0.25); // 25% safety buffer
        int recommendedStock = predictedDemand + safetyBuffer;

        String riskLevel;
        if (currentStock < predictedDemand) {
            riskLevel = "HIGH";
        } else if (currentStock < recommendedStock) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        String explanation = String.format(
                "Academic Demand Forecast (%d days): Estimated demand is %d units (daily avg %.2f units). " +
                "Current stock is %d units. Recommended stock is %d units (includes 25%% safety buffer of %d units). " +
                "Stockout Risk: %s.",
                forecastDays, predictedDemand, averageDailyDemand, currentStock, recommendedStock, safetyBuffer, riskLevel
        );

        MedicineDemandForecast forecast = new MedicineDemandForecast();
        forecast.setMedicineId(medicine.getId());
        forecast.setPhcId(phcId);
        forecast.setForecastDate(today.plusDays(forecastDays));
        forecast.setPredictedDemand(predictedDemand);
        forecast.setCurrentStock(currentStock);
        forecast.setRecommendedStock(recommendedStock);
        forecast.setRiskLevel(riskLevel);
        forecast.setExplanation(explanation);

        MedicineDemandForecast saved = forecastRepository.save(forecast);
        
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("action", "FORECAST_GENERATED");
            req.put("entityType", "MEDICINE_FORECAST");
            req.put("entityId", String.valueOf(saved.getId()));
            req.put("performedBy", currentUser.getId());
            req.put("performedByName", currentUser.getUsername());
            req.put("details", "Generated " + forecastDays + "-day demand forecast for " + medicine.getName() + " (Demand: " + predictedDemand + ")");
            req.put("httpStatus", "SUCCESS");
            req.put("httpMethod", "POST");
            req.put("requestPath", "/medicine-forecasts/generate");
            restTemplate.postForObject("http://ADMIN-SERVICE/internal/audit-logs", req, Void.class);
        } catch (Exception e) {
            // Ignore integration logging error to keep transaction stable
        }

        MedicineDemandForecastResponseDTO dto = new MedicineDemandForecastResponseDTO(saved);
        dto.setMedicineName(medicine.getName());
        dto.setMedicineCode(medicine.getCode());
        return dto;
    }

    public List<MedicineDemandForecastResponseDTO> getForecasts(User currentUser) {
        checkForecastAccess(currentUser);

        String role = currentUser.getRole();
        List<MedicineDemandForecast> forecasts;

        if ("ADMIN".equals(role)) {
            forecasts = forecastRepository.findAll();
        } else {
            String phcId = currentUser.getPhcId();
            forecasts = (phcId != null) ? forecastRepository.findByPhcIdOrderByGeneratedAtDesc(phcId) : Collections.emptyList();
        }

        Map<Long, Medicine> medicineMap = new HashMap<>();
        for (MedicineDemandForecast f : forecasts) {
            if (!medicineMap.containsKey(f.getMedicineId())) {
                try {
                    Medicine m = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicines/id/" + f.getMedicineId(), Medicine.class);
                    if (m != null) {
                        medicineMap.put(m.getId(), m);
                    }
                } catch (Exception e) {
                    // Ignore query failure
                }
            }
        }

        return forecasts.stream().map(f -> {
            MedicineDemandForecastResponseDTO dto = new MedicineDemandForecastResponseDTO(f);
            Medicine m = medicineMap.get(f.getMedicineId());
            if (m != null) {
                dto.setMedicineName(m.getName());
                dto.setMedicineCode(m.getCode());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<MedicineDemandForecastResponseDTO> getForecastByMedicineId(Long medicineId, User currentUser) {
        checkForecastAccess(currentUser);

        Medicine medicine = restTemplate.getForObject("http://PHARMACY-SERVICE/internal/medicines/id/" + medicineId, Medicine.class);
        if (medicine == null) {
            throw new ResourceNotFoundException("Medicine not found with ID: " + medicineId);
        }

        String role = currentUser.getRole();
        List<MedicineDemandForecast> forecasts;

        if ("ADMIN".equals(role)) {
            forecasts = forecastRepository.findByMedicineIdOrderByGeneratedAtDesc(medicineId);
        } else {
            String phcId = currentUser.getPhcId();
            if (phcId == null) {
                forecasts = Collections.emptyList();
            } else {
                forecasts = forecastRepository.findByMedicineIdOrderByGeneratedAtDesc(medicineId).stream()
                        .filter(f -> phcId.equals(f.getPhcId()))
                        .collect(Collectors.toList());
            }
        }

        return forecasts.stream().map(f -> {
            MedicineDemandForecastResponseDTO dto = new MedicineDemandForecastResponseDTO(f);
            dto.setMedicineName(medicine.getName());
            dto.setMedicineCode(medicine.getCode());
            return dto;
        }).collect(Collectors.toList());
    }
}
