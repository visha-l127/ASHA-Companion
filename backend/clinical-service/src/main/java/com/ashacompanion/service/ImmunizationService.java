package com.ashacompanion.service;

import com.ashacompanion.dto.ImmunizationRequestDTO;
import com.ashacompanion.dto.ImmunizationResponseDTO;
import com.ashacompanion.dto.ImmunizationSummaryDTO;
import com.ashacompanion.entity.ImmunizationRecord;
import com.ashacompanion.entity.Patient;
import com.ashacompanion.entity.Vaccine;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.DuplicateImmunizationException;
import com.ashacompanion.exception.InactiveVaccineException;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.ImmunizationRecordRepository;
import com.ashacompanion.repository.PatientRepository;
import com.ashacompanion.repository.VaccineRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ImmunizationService {

    private final ImmunizationRecordRepository immunizationRecordRepository;
    private final PatientRepository patientRepository;
    private final VaccineRepository vaccineRepository;
    private final UserRepository userRepository;

    public ImmunizationService(ImmunizationRecordRepository immunizationRecordRepository,
                               PatientRepository patientRepository,
                               VaccineRepository vaccineRepository,
                               UserRepository userRepository) {
        this.immunizationRecordRepository = immunizationRecordRepository;
        this.patientRepository = patientRepository;
        this.vaccineRepository = vaccineRepository;
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
    public ImmunizationResponseDTO createImmunization(ImmunizationRequestDTO request) {
        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to create immunization record");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        Vaccine vaccine = vaccineRepository.findById(request.getVaccineId())
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found with ID: " + request.getVaccineId()));

        if (!vaccine.isActive()) {
            throw new InactiveVaccineException("Vaccine is inactive: " + vaccine.getCode());
        }

        // Scope validation
        if (isAsha) {
            if (!currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
            if (patient.getPhcId() == null || !patient.getPhcId().equals(currentUser.getPhcId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another PHC");
            }
        }

        // Logical validation
        if (request.getAdministered()) {
            if (request.getAdministeredDate() == null) {
                throw new IllegalArgumentException("Administered date is required when marked as administered");
            }
            if (request.getAdministeredDate().isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Administered date cannot be in the future");
            }
        }

        // Duplicate checks
        if (request.getAdministeredDate() != null) {
            if (immunizationRecordRepository.existsByPatientIdAndVaccineIdAndDoseNumberAndAdministeredDate(
                    patient.getId(), vaccine.getId(), request.getDoseNumber(), request.getAdministeredDate())) {
                throw new DuplicateImmunizationException("An identical immunization record already exists");
            }
        }

        Optional<ImmunizationRecord> existing = immunizationRecordRepository.findByPatientIdAndVaccineIdAndDoseNumber(
                patient.getId(), vaccine.getId(), request.getDoseNumber());
        if (existing.isPresent()) {
            throw new DuplicateImmunizationException("An immunization record for this vaccine and dose already exists");
        }

        ImmunizationRecord record = new ImmunizationRecord();
        record.setPatient(patient);
        record.setVaccine(vaccine);
        record.setDoseNumber(request.getDoseNumber());
        record.setAdministeredDate(request.getAdministeredDate());
        record.setBatchNumber(request.getBatchNumber());
        record.setAdministeredBy(currentUser.getId());
        record.setNotes(request.getNotes());
        record.setAdministered(request.getAdministered());
        record.setNextDueDate(request.getNextDueDate());

        ImmunizationRecord savedRecord = immunizationRecordRepository.save(record);
        return new ImmunizationResponseDTO(savedRecord);
    }

    public ImmunizationResponseDTO getImmunizationById(Long id) {
        ImmunizationRecord record = immunizationRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Immunization record not found with ID: " + id));

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

        return new ImmunizationResponseDTO(record);
    }

    public List<ImmunizationResponseDTO> getPatientImmunizations(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can view all
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

        return immunizationRecordRepository.findByPatientId(patientId).stream()
                .map(ImmunizationResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<ImmunizationResponseDTO> getUpcomingImmunizations() {
        User currentUser = getCurrentUser();
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(30);

        List<ImmunizationRecord> records;
        if ("ADMIN".equals(currentUser.getRole())) {
            records = immunizationRecordRepository.findByAdministeredAndNextDueDateBetween(0, start, end);
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                records = List.of();
            } else {
                records = immunizationRecordRepository.findByAdministeredAndNextDueDateBetweenAndPatientPhcId(0, start, end, phcId);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            records = immunizationRecordRepository.findByAdministeredAndNextDueDateBetweenAndPatientAshaWorkerId(0, start, end, currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return records.stream()
                .map(ImmunizationResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<ImmunizationResponseDTO> getOverdueImmunizations() {
        User currentUser = getCurrentUser();
        LocalDate today = LocalDate.now();

        List<ImmunizationRecord> records;
        if ("ADMIN".equals(currentUser.getRole())) {
            records = immunizationRecordRepository.findByAdministeredAndNextDueDateBefore(0, today);
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                records = List.of();
            } else {
                records = immunizationRecordRepository.findByAdministeredAndNextDueDateBeforeAndPatientPhcId(0, today, phcId);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            records = immunizationRecordRepository.findByAdministeredAndNextDueDateBeforeAndPatientAshaWorkerId(0, today, currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return records.stream()
                .map(ImmunizationResponseDTO::new)
                .collect(Collectors.toList());
    }

    public ImmunizationSummaryDTO getImmunizationSummary(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can view all
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

        List<ImmunizationRecord> records = immunizationRecordRepository.findByPatientId(patientId);
        long totalVaccinations = records.size();
        long administeredCount = records.stream().filter(ImmunizationRecord::isAdministered).count();
        long pendingCount = totalVaccinations - administeredCount;

        LocalDate today = LocalDate.now();
        long overdueCount = records.stream()
                .filter(r -> !r.isAdministered() && r.getNextDueDate() != null && r.getNextDueDate().isBefore(today))
                .count();

        long upcomingCount = records.stream()
                .filter(r -> !r.isAdministered() && r.getNextDueDate() != null && !r.getNextDueDate().isBefore(today) && !r.getNextDueDate().isAfter(today.plusDays(30)))
                .count();

        LocalDate nextDueDate = records.stream()
                .filter(r -> !r.isAdministered() && r.getNextDueDate() != null)
                .map(ImmunizationRecord::getNextDueDate)
                .min(LocalDate::compareTo)
                .orElse(null);

        return new ImmunizationSummaryDTO(
                patientId,
                patient.getName(),
                totalVaccinations,
                administeredCount,
                pendingCount,
                overdueCount,
                upcomingCount,
                nextDueDate
        );
    }

    @Transactional
    public ImmunizationResponseDTO updateImmunization(Long id, ImmunizationRequestDTO request) {
        ImmunizationRecord record = immunizationRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Immunization record not found with ID: " + id));

        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());
        boolean isSupervisor = "PHC_SUPERVISOR".equals(currentUser.getRole());

        if (!isAdmin && !isAsha && !isSupervisor) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to update record");
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

        // Logical validation
        if (request.getAdministered()) {
            if (request.getAdministeredDate() == null) {
                throw new IllegalArgumentException("Administered date is required when marked as administered");
            }
            if (request.getAdministeredDate().isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Administered date cannot be in the future");
            }
        }

        record.setDoseNumber(request.getDoseNumber());
        record.setAdministeredDate(request.getAdministeredDate());
        record.setBatchNumber(request.getBatchNumber());
        record.setNotes(request.getNotes());
        record.setAdministered(request.getAdministered());
        record.setNextDueDate(request.getNextDueDate());

        ImmunizationRecord savedRecord = immunizationRecordRepository.save(record);
        return new ImmunizationResponseDTO(savedRecord);
    }

    @Transactional
    public void deleteImmunization(Long id) {
        ImmunizationRecord record = immunizationRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Immunization record not found with ID: " + id));

        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());
        boolean isSupervisor = "PHC_SUPERVISOR".equals(currentUser.getRole());

        if (!isAdmin && !isAsha && !isSupervisor) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to delete record");
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

        immunizationRecordRepository.delete(record);
    }
}
