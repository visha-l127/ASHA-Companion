package com.ashacompanion.service;

import com.ashacompanion.dto.NutritionRecordRequestDTO;
import com.ashacompanion.dto.NutritionRecordResponseDTO;
import com.ashacompanion.entity.NutritionRecord;
import com.ashacompanion.entity.Patient;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.NutritionRecordRepository;
import com.ashacompanion.repository.PatientRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NutritionService {

    private final NutritionRecordRepository nutritionRecordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public NutritionService(NutritionRecordRepository nutritionRecordRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository) {
        this.nutritionRecordRepository = nutritionRecordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    @Transactional
    public NutritionRecordResponseDTO createNutritionRecord(NutritionRecordRequestDTO request) {
        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to create nutrition record");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        // Scoped check for ASHA worker
        if (isAsha) {
            if (!currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another ASHA worker");
            }
            if (patient.getPhcId() == null || !patient.getPhcId().equals(currentUser.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
        }

        // Validate measurement date is not in the future
        if (request.getMeasurementDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Measurement date cannot be in the future");
        }

        // Run clinical evaluation proxy
        NutritionRiskEvaluator.EvaluationResult evaluation = NutritionRiskEvaluator.evaluate(
                request.getWeightKg(), request.getHeightCm(), request.getMuacCm());

        NutritionRecord record = new NutritionRecord();
        record.setPatient(patient);
        record.setMeasurementDate(request.getMeasurementDate());
        record.setWeightKg(request.getWeightKg());
        record.setHeightCm(request.getHeightCm());
        record.setMuacCm(request.getMuacCm());
        record.setAgeMonths(request.getAgeMonths());
        record.setFeedingType(request.getFeedingType());
        record.setNotes(request.getNotes());
        record.setRecordedByUserId(currentUser.getId());
        record.setNutritionStatus(evaluation.getStatus());
        record.setRiskFlag(evaluation.isRiskFlag());
        record.setRiskFactors(evaluation.getRiskFactors());

        NutritionRecord savedRecord = nutritionRecordRepository.save(record);
        return new NutritionRecordResponseDTO(savedRecord);
    }

    public NutritionRecordResponseDTO getNutritionRecordById(Long id) {
        NutritionRecord record = nutritionRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition record not found with ID: " + id));

        User currentUser = getCurrentUser();
        Patient patient = record.getPatient();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin has global access
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(patient.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return new NutritionRecordResponseDTO(record);
    }

    public List<NutritionRecordResponseDTO> getAllNutritionRecords() {
        User currentUser = getCurrentUser();
        List<NutritionRecord> records;

        if ("ADMIN".equals(currentUser.getRole())) {
            records = nutritionRecordRepository.findAll();
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                records = List.of();
            } else {
                records = nutritionRecordRepository.findByPatientPhcId(phcId);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            records = nutritionRecordRepository.findByPatientAshaWorkerId(currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return records.stream()
                .map(NutritionRecordResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<NutritionRecordResponseDTO> getPatientNutritionHistory(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin has global access
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(patient.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return nutritionRecordRepository.findByPatientIdOrderByMeasurementDateDesc(patientId).stream()
                .map(NutritionRecordResponseDTO::new)
                .collect(Collectors.toList());
    }

    public NutritionRecordResponseDTO getPatientLatestNutritionRecord(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin has global access
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(patient.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        NutritionRecord record = nutritionRecordRepository.findFirstByPatientIdOrderByMeasurementDateDesc(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("No nutrition records found for patient ID: " + patientId));

        return new NutritionRecordResponseDTO(record);
    }

    public List<NutritionRecordResponseDTO> getHighRiskNutritionRecords() {
        User currentUser = getCurrentUser();
        List<NutritionRecord> records;

        if ("ADMIN".equals(currentUser.getRole())) {
            records = nutritionRecordRepository.findByRiskFlag(1);
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                records = List.of();
            } else {
                records = nutritionRecordRepository.findByRiskFlagAndPatientPhcId(1, phcId);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            records = nutritionRecordRepository.findByRiskFlagAndPatientAshaWorkerId(1, currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return records.stream()
                .map(NutritionRecordResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public NutritionRecordResponseDTO updateNutritionRecord(Long id, com.ashacompanion.dto.NutritionRecordUpdateRequestDTO request) {
        NutritionRecord record = nutritionRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition record not found with ID: " + id));

        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());
        boolean isSupervisor = "PHC_SUPERVISOR".equals(currentUser.getRole());

        if (!isAdmin && !isAsha && !isSupervisor) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to update nutrition record");
        }

        if (isAsha) {
            if (!currentUser.getId().equals(record.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else if (isSupervisor) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(record.getPatient().getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
        }

        if (request.getMeasurementDate() != null) {
            if (request.getMeasurementDate().isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Measurement date cannot be in the future");
            }
            record.setMeasurementDate(request.getMeasurementDate());
        }

        if (request.getWeightKg() != null) record.setWeightKg(request.getWeightKg());
        if (request.getHeightCm() != null) record.setHeightCm(request.getHeightCm());
        if (request.getMuacCm() != null) record.setMuacCm(request.getMuacCm());
        if (request.getAgeMonths() != null) record.setAgeMonths(request.getAgeMonths());
        if (request.getFeedingType() != null) record.setFeedingType(request.getFeedingType());
        if (request.getNotes() != null) record.setNotes(request.getNotes());

        NutritionRiskEvaluator.EvaluationResult evaluation = NutritionRiskEvaluator.evaluate(
                record.getWeightKg(), record.getHeightCm(), record.getMuacCm());
        record.setNutritionStatus(evaluation.getStatus());
        record.setRiskFlag(evaluation.isRiskFlag());
        record.setRiskFactors(evaluation.getRiskFactors());

        NutritionRecord saved = nutritionRecordRepository.save(record);
        return new NutritionRecordResponseDTO(saved);
    }

    @Transactional
    public void deleteNutritionRecord(Long id) {
        NutritionRecord record = nutritionRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition record not found with ID: " + id));

        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());
        boolean isSupervisor = "PHC_SUPERVISOR".equals(currentUser.getRole());

        if (!isAdmin && !isAsha && !isSupervisor) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to delete nutrition record");
        }

        if (isAsha) {
            if (!currentUser.getId().equals(record.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else if (isSupervisor) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(record.getPatient().getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
        }

        nutritionRecordRepository.delete(record);
    }
}
