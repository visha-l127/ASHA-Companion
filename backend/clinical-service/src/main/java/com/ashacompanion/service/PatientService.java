package com.ashacompanion.service;

import com.ashacompanion.dto.PatientRequestDTO;
import com.ashacompanion.dto.PatientResponseDTO;
import com.ashacompanion.entity.Patient;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.PatientRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public PatientService(PatientRepository patientRepository, UserRepository userRepository, RestTemplate restTemplate) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    private void recordAudit(String action, String entityType, String entityId, User user, String details, String method, String path, String status) {
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("action", action);
            req.put("entityType", entityType);
            req.put("entityId", entityId);
            req.put("performedBy", user.getId());
            req.put("performedByName", user.getUsername());
            req.put("details", details);
            req.put("httpStatus", status);
            req.put("httpMethod", method);
            req.put("requestPath", path);
            restTemplate.postForObject("http://ADMIN-SERVICE/internal/audit-logs", req, Void.class);
        } catch (Exception e) {
            // Ignore audit logging failures to keep core transactional logic stable
        }
    }

    public PatientResponseDTO createPatient(PatientRequestDTO request) {
        User currentUser = getCurrentUser();

        if (!"ASHA".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only ASHA workers can create patients");
        }

        if (currentUser.getPhcId() == null || currentUser.getPhcId().trim().isEmpty()) {
            throw new AccessDeniedException("Access denied: ASHA worker does not belong to any PHC");
        }

        Patient patient = new Patient();
        patient.setName(request.getName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setVillage(request.getVillage());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setPhcId(currentUser.getPhcId());
        patient.setAshaWorkerId(currentUser.getId());

        Patient savedPatient = patientRepository.save(patient);
        recordAudit("PATIENT_CREATED", "PATIENT", String.valueOf(savedPatient.getId()), currentUser,
                "Registered new patient: " + savedPatient.getName(), "POST", "/patients", "SUCCESS");
        return new PatientResponseDTO(savedPatient);
    }

    public List<PatientResponseDTO> getAllPatients() {
        User currentUser = getCurrentUser();
        List<Patient> patients;

        if ("ADMIN".equals(currentUser.getRole())) {
            patients = patientRepository.findAll();
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                patients = List.of();
            } else {
                patients = patientRepository.findByPhcId(phcId);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            patients = patientRepository.findByAshaWorkerId(currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return patients.stream()
                .filter(Patient::isActive)
                .map(PatientResponseDTO::new)
                .collect(Collectors.toList());
    }

    public PatientResponseDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can read all
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

        return new PatientResponseDTO(patient);
    }

    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can update all
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

        patient.setName(request.getName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setVillage(request.getVillage());
        patient.setEmergencyContact(request.getEmergencyContact());

        Patient savedPatient = patientRepository.save(patient);
        recordAudit("PATIENT_UPDATED", "PATIENT", String.valueOf(savedPatient.getId()), currentUser,
                "Updated patient: " + savedPatient.getName(), "PUT", "/patients/" + id, "SUCCESS");
        return new PatientResponseDTO(savedPatient);
    }

    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can delete all
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(patient.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient belongs to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        patient.setActive(false);
        patientRepository.save(patient);
        recordAudit("PATIENT_DELETED", "PATIENT", String.valueOf(id), currentUser,
                "Deactivated patient: " + patient.getName(), "DELETE", "/patients/" + id, "SUCCESS");
    }
}
