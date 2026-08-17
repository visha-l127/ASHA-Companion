package com.ashacompanion.service;

import com.ashacompanion.entity.PriorityVisit;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.PriorityVisitRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class PriorityVisitService {

    @Autowired
    private PriorityVisitRepository priorityVisitRepository;

    @Autowired
    private UserRepository userRepository;

    public List<PriorityVisit> getAllPriorityVisits() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Collections.emptyList();
        }
        User currentUser = userRepository.findByUsername(auth.getName()).orElse(null);
        if (currentUser == null) {
            return Collections.emptyList();
        }

        List<PriorityVisit> allVisits = priorityVisitRepository.findAll();
        String role = currentUser.getRole();

        if ("ADMIN".equals(role)) {
            return allVisits;
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId == null) {
                return Collections.emptyList();
            }
            return allVisits.stream().filter(v -> {
                Optional<User> asha = userRepository.findByUsername(v.getAshaId());
                if (asha.isPresent()) {
                    return phcId.equals(asha.get().getPhcId());
                }
                return true;
            }).collect(Collectors.toList());
        } else {
            return allVisits.stream()
                    .filter(v -> currentUser.getUsername().equals(v.getAshaId()))
                    .collect(Collectors.toList());
        }
    }

    public Optional<PriorityVisit> getPriorityVisitById(Long id) {
        return priorityVisitRepository.findById(id);
    }

    public PriorityVisit createPriorityVisit(PriorityVisit visit) {
        if (visit.getAssignedDate() == null) {
            visit.setAssignedDate(LocalDate.now());
        }
        if (visit.getStatus() == null) {
            visit.setStatus("Pending");
        }
        return priorityVisitRepository.save(visit);
    }

    public PriorityVisit updatePriorityVisit(Long id, PriorityVisit visitDetails) {
        Optional<PriorityVisit> optionalVisit = priorityVisitRepository.findById(id);
        if (optionalVisit.isPresent()) {
            PriorityVisit existing = optionalVisit.get();
            if (visitDetails.getPatientName() != null) {
                existing.setPatientName(visitDetails.getPatientName());
            }
            if (visitDetails.getVillage() != null) {
                existing.setVillage(visitDetails.getVillage());
            }
            if (visitDetails.getAshaId() != null) {
                existing.setAshaId(visitDetails.getAshaId());
            }
            if (visitDetails.getAshaName() != null) {
                existing.setAshaName(visitDetails.getAshaName());
            }
            if (visitDetails.getCondition() != null) {
                existing.setCondition(visitDetails.getCondition());
            }
            if (visitDetails.getUrgency() != null) {
                existing.setUrgency(visitDetails.getUrgency());
            }
            if (visitDetails.getStatus() != null) {
                existing.setStatus(visitDetails.getStatus());
            }
            if (visitDetails.getNotes() != null) {
                existing.setNotes(visitDetails.getNotes());
            }
            return priorityVisitRepository.save(existing);
        }
        throw new RuntimeException("PriorityVisit not found with id: " + id);
    }

    public void deletePriorityVisit(Long id) {
        priorityVisitRepository.deleteById(id);
    }
}
