package com.ashacompanion.service;

import com.ashacompanion.dto.AntenatalVisitRequestDTO;
import com.ashacompanion.dto.AntenatalVisitResponseDTO;
import com.ashacompanion.entity.AntenatalVisit;
import com.ashacompanion.entity.Pregnancy;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.AntenatalVisitRepository;
import com.ashacompanion.repository.PregnancyRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AntenatalVisitService {

    private final AntenatalVisitRepository antenatalVisitRepository;
    private final PregnancyRepository pregnancyRepository;
    private final UserRepository userRepository;

    public AntenatalVisitService(AntenatalVisitRepository antenatalVisitRepository,
                                 PregnancyRepository pregnancyRepository,
                                 UserRepository userRepository) {
        this.antenatalVisitRepository = antenatalVisitRepository;
        this.pregnancyRepository = pregnancyRepository;
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

    public AntenatalVisitResponseDTO createVisit(Long pregnancyId, AntenatalVisitRequestDTO request) {
        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to create ANC visit");
        }

        Pregnancy pregnancy = pregnancyRepository.findById(pregnancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + pregnancyId));

        if (isAsha) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Pregnancy is assigned to another ASHA worker");
            }
        }

        AntenatalVisit visit = new AntenatalVisit();
        visit.setPregnancy(pregnancy);
        visit.setVisitDate(request.getVisitDate());
        visit.setWeight(request.getWeight());
        visit.setSystolicBp(request.getSystolicBp());
        visit.setDiastolicBp(request.getDiastolicBp());
        visit.setHemoglobin(request.getHemoglobin());
        visit.setFetalHeartRate(request.getFetalHeartRate());
        visit.setDangerSigns(request.getDangerSigns());
        visit.setSymptoms(request.getSymptoms());
        visit.setClinicalNotes(request.getClinicalNotes());
        visit.setNextVisitDate(request.getNextVisitDate());
        visit.setRecordedByUserId(currentUser.getId());
        visit.setActive(true);

        // Risk Evaluation
        MaternalRiskEvaluator.RiskAssessment assessment = MaternalRiskEvaluator.evaluateVisitRisk(visit);
        visit.setHighRisk(assessment.isHighRisk());
        visit.setRiskNotes(assessment.getRiskNotes());

        if (assessment.isHighRisk()) {
            pregnancy.setHighRisk(true);
            String existingRisk = pregnancy.getRiskFactors();
            String newRisk = assessment.getRiskFactors();
            if (newRisk != null && !newRisk.trim().isEmpty()) {
                if (existingRisk == null || existingRisk.trim().isEmpty()) {
                    pregnancy.setRiskFactors(newRisk);
                } else {
                    LinkedHashSet<String> combined = new LinkedHashSet<>();
                    for (String r : existingRisk.split(", ")) {
                        if (!r.trim().isEmpty()) combined.add(r.trim());
                    }
                    for (String r : newRisk.split(", ")) {
                        if (!r.trim().isEmpty()) combined.add(r.trim());
                    }
                    pregnancy.setRiskFactors(String.join(", ", combined));
                }
            }
            pregnancyRepository.save(pregnancy);
        }

        AntenatalVisit savedVisit = antenatalVisitRepository.save(visit);
        return new AntenatalVisitResponseDTO(savedVisit);
    }

    public List<AntenatalVisitResponseDTO> getVisitsByPregnancyId(Long pregnancyId) {
        Pregnancy pregnancy = pregnancyRepository.findById(pregnancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + pregnancyId));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can view all
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(pregnancy.getPatient().getPhcId())) {
                throw new AccessDeniedException("Access denied: Pregnancy belongs to another PHC");
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return antenatalVisitRepository.findByPregnancyId(pregnancyId).stream()
                .map(AntenatalVisitResponseDTO::new)
                .collect(Collectors.toList());
    }

    public AntenatalVisitResponseDTO getVisitById(Long id) {
        AntenatalVisit visit = antenatalVisitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ANC visit not found with ID: " + id));

        User currentUser = getCurrentUser();
        Pregnancy pregnancy = visit.getPregnancy();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can view all
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(pregnancy.getPatient().getPhcId())) {
                throw new AccessDeniedException("Access denied: Record belongs to another PHC");
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return new AntenatalVisitResponseDTO(visit);
    }

    public AntenatalVisitResponseDTO updateVisit(Long id, AntenatalVisitRequestDTO request) {
        AntenatalVisit visit = antenatalVisitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ANC visit not found with ID: " + id));

        User currentUser = getCurrentUser();
        Pregnancy pregnancy = visit.getPregnancy();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isAsha = "ASHA".equals(currentUser.getRole());

        if (!isAdmin && !isAsha) {
            throw new AccessDeniedException("Access denied: Insufficient privileges to update ANC visit");
        }

        if (isAsha) {
            if (!currentUser.getId().equals(pregnancy.getPatient().getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Patient is assigned to another ASHA worker");
            }
        }

        visit.setVisitDate(request.getVisitDate());
        visit.setWeight(request.getWeight());
        visit.setSystolicBp(request.getSystolicBp());
        visit.setDiastolicBp(request.getDiastolicBp());
        visit.setHemoglobin(request.getHemoglobin());
        visit.setFetalHeartRate(request.getFetalHeartRate());
        visit.setDangerSigns(request.getDangerSigns());
        visit.setSymptoms(request.getSymptoms());
        visit.setClinicalNotes(request.getClinicalNotes());
        visit.setNextVisitDate(request.getNextVisitDate());

        // Re-run risk evaluation
        MaternalRiskEvaluator.RiskAssessment assessment = MaternalRiskEvaluator.evaluateVisitRisk(visit);
        visit.setHighRisk(assessment.isHighRisk());
        visit.setRiskNotes(assessment.getRiskNotes());

        if (assessment.isHighRisk()) {
            pregnancy.setHighRisk(true);
            String existingRisk = pregnancy.getRiskFactors();
            String newRisk = assessment.getRiskFactors();
            if (newRisk != null && !newRisk.trim().isEmpty()) {
                if (existingRisk == null || existingRisk.trim().isEmpty()) {
                    pregnancy.setRiskFactors(newRisk);
                } else {
                    LinkedHashSet<String> combined = new LinkedHashSet<>();
                    for (String r : existingRisk.split(", ")) {
                        if (!r.trim().isEmpty()) combined.add(r.trim());
                    }
                    for (String r : newRisk.split(", ")) {
                        if (!r.trim().isEmpty()) combined.add(r.trim());
                    }
                    pregnancy.setRiskFactors(String.join(", ", combined));
                }
            }
            pregnancyRepository.save(pregnancy);
        }

        AntenatalVisit savedVisit = antenatalVisitRepository.save(visit);
        return new AntenatalVisitResponseDTO(savedVisit);
    }

    public List<AntenatalVisitResponseDTO> getAllVisits() {
        User currentUser = getCurrentUser();
        List<AntenatalVisit> visits;
        String role = currentUser.getRole();

        if ("ADMIN".equals(role)) {
            visits = antenatalVisitRepository.findAll();
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                visits = List.of();
            } else {
                visits = antenatalVisitRepository.findByPregnancyPatientPhcId(phcId);
            }
        } else if ("ASHA".equals(role)) {
            visits = antenatalVisitRepository.findByRecordedByUserId(currentUser.getId());
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return visits.stream()
                .filter(AntenatalVisit::isActive)
                .map(AntenatalVisitResponseDTO::new)
                .collect(Collectors.toList());
    }

    public void deleteVisit(Long id) {
        AntenatalVisit visit = antenatalVisitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ANC visit not found with ID: " + id));

        User currentUser = getCurrentUser();
        String role = currentUser.getRole();

        if ("ADMIN".equals(role)) {
            // Admin can delete all
        } else if ("ASHA".equals(role)) {
            if (!currentUser.getId().equals(visit.getRecordedByUserId())) {
                throw new AccessDeniedException("Access denied: Record belongs to another user");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        visit.setActive(false);
        antenatalVisitRepository.save(visit);
    }
}
