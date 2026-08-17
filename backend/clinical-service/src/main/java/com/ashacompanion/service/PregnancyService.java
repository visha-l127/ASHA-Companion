package com.ashacompanion.service;

import com.ashacompanion.dto.PregnancyRequestDTO;
import com.ashacompanion.dto.PregnancyResponseDTO;
import com.ashacompanion.entity.Patient;
import com.ashacompanion.entity.Pregnancy;
import com.ashacompanion.entity.PregnancyStatus;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.PatientRepository;
import com.ashacompanion.repository.PregnancyRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PregnancyService {

    private final PregnancyRepository pregnancyRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PregnancyService(PregnancyRepository pregnancyRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository) {
        this.pregnancyRepository = pregnancyRepository;
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

    public PregnancyResponseDTO createPregnancy(PregnancyRequestDTO request) {
        User currentUser = getCurrentUser();

        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to register pregnancy");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        // Scope check for ASHA worker
        if (isAsha) {
            if (!currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another ASHA worker");
            }
        }

        Pregnancy pregnancy = new Pregnancy();
        pregnancy.setPatient(patient);
        pregnancy.setLastMenstrualPeriod(request.getLastMenstrualPeriod());
        pregnancy.setExpectedDeliveryDate(request.getLastMenstrualPeriod().plusDays(280));
        pregnancy.setGravida(request.getGravida());
        pregnancy.setPara(request.getPara());
        pregnancy.setBloodGroup(request.getBloodGroup());

        if (request.getPregnancyStatus() != null) {
            try {
                pregnancy.setPregnancyStatus(PregnancyStatus.valueOf(request.getPregnancyStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid pregnancy status: " + request.getPregnancyStatus());
            }
        } else {
            pregnancy.setPregnancyStatus(PregnancyStatus.REGISTERED);
        }

        if (request.getGravida() != null && request.getGravida() >= 5) {
            pregnancy.setHighRisk(true);
            pregnancy.setRiskFactors("High Gravida (>= 5)");
        } else {
            pregnancy.setHighRisk(false);
        }
        pregnancy.setActive(true);

        Pregnancy savedPregnancy = pregnancyRepository.save(pregnancy);
        return new PregnancyResponseDTO(savedPregnancy);
    }

    public PregnancyResponseDTO getPregnancyById(Long id) {
        Pregnancy pregnancy = pregnancyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin gets global access
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(pregnancy.getPatient().getPhcId())) {
                throw new AccessDeniedException("Access denied: Pregnancy record belongs to another PHC");
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return new PregnancyResponseDTO(pregnancy);
    }

    public List<PregnancyResponseDTO> getAllPregnancies() {
        User currentUser = getCurrentUser();
        List<Pregnancy> pregnancies;

        if ("ADMIN".equals(currentUser.getRole())) {
            pregnancies = pregnancyRepository.findAll();
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                pregnancies = List.of();
            } else {
                pregnancies = pregnancyRepository.findByPatientPhcId(phcId);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            pregnancies = pregnancyRepository.findByPatientAshaWorkerId(currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return pregnancies.stream()
                .map(PregnancyResponseDTO::new)
                .collect(Collectors.toList());
    }

    public PregnancyResponseDTO updatePregnancy(Long id, PregnancyRequestDTO request) {
        Pregnancy pregnancy = pregnancyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + id));

        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to update pregnancy");
        }

        if (isAsha) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        }

        pregnancy.setLastMenstrualPeriod(request.getLastMenstrualPeriod());
        pregnancy.setExpectedDeliveryDate(request.getLastMenstrualPeriod().plusDays(280));
        pregnancy.setGravida(request.getGravida());
        pregnancy.setPara(request.getPara());
        pregnancy.setBloodGroup(request.getBloodGroup());
        if (request.getGravida() != null && request.getGravida() >= 5) {
            pregnancy.setHighRisk(true);
            pregnancy.setRiskFactors("High Gravida (>= 5)");
        }

        if (request.getPregnancyStatus() != null) {
            try {
                pregnancy.setPregnancyStatus(PregnancyStatus.valueOf(request.getPregnancyStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid pregnancy status: " + request.getPregnancyStatus());
            }
        }

        Pregnancy savedPregnancy = pregnancyRepository.save(pregnancy);
        return new PregnancyResponseDTO(savedPregnancy);
    }

    public PregnancyResponseDTO changePregnancyStatus(Long id, String status) {
        Pregnancy pregnancy = pregnancyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + id));

        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to change status");
        }

        if (isAsha) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        }

        try {
            pregnancy.setPregnancyStatus(PregnancyStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid pregnancy status: " + status);
        }

        Pregnancy savedPregnancy = pregnancyRepository.save(pregnancy);
        return new PregnancyResponseDTO(savedPregnancy);
    }

    public List<PregnancyResponseDTO> getHighRiskPregnancies() {
        User currentUser = getCurrentUser();
        List<Pregnancy> pregnancies;

        if ("ADMIN".equals(currentUser.getRole())) {
            pregnancies = pregnancyRepository.findByHighRisk(1);
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                pregnancies = List.of();
            } else {
                pregnancies = pregnancyRepository.findByHighRiskAndPatientPhcId(1, phcId);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            pregnancies = pregnancyRepository.findByHighRiskAndPatientAshaWorkerId(1, currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return pregnancies.stream()
                .map(PregnancyResponseDTO::new)
                .collect(Collectors.toList());
    }

    public void deletePregnancy(Long id) {
        Pregnancy pregnancy = pregnancyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + id));

        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to delete pregnancy");
        }

        if (isAsha) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        }

        pregnancy.setActive(false);
        pregnancy.setPregnancyStatus(PregnancyStatus.COMPLETED);
        pregnancyRepository.save(pregnancy);
    }
}
