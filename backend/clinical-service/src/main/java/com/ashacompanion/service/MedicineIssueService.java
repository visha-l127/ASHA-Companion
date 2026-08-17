package com.ashacompanion.service;

import com.ashacompanion.entity.MedicineIssue;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.MedicineIssueRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MedicineIssueService {

    private final MedicineIssueRepository medicineIssueRepository;
    private final UserRepository userRepository;

    public MedicineIssueService(MedicineIssueRepository medicineIssueRepository, UserRepository userRepository) {
        this.medicineIssueRepository = medicineIssueRepository;
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

    public MedicineIssue createMedicineIssue(MedicineIssue record) {
        User currentUser = getCurrentUser();

        if (!"ASHA".equals(currentUser.getRole()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only ASHA workers and Admins can record medicine issues");
        }

        record.setAshaWorkerId(currentUser.getId());
        record.setPhcId(currentUser.getPhcId());
        record.setActive(1);

        return medicineIssueRepository.save(record);
    }

    public List<MedicineIssue> getAllMedicineIssues() {
        User currentUser = getCurrentUser();
        String role = currentUser.getRole();

        if ("ADMIN".equals(role)) {
            return medicineIssueRepository.findByActive(1);
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                return List.of();
            }
            return medicineIssueRepository.findByPhcIdAndActive(phcId, 1);
        } else if ("ASHA".equals(role)) {
            return medicineIssueRepository.findByAshaWorkerIdAndActive(currentUser.getId(), 1);
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }
    }

    public List<MedicineIssue> getMedicineIssuesByPatientId(Long patientId) {
        User currentUser = getCurrentUser();
        // Permission validation is handled inside patient record check or simply return matching patient's active issues
        return medicineIssueRepository.findByPatientIdAndActive(patientId, 1);
    }

    public MedicineIssue updateMedicineIssue(Long id, MedicineIssue updateData) {
        MedicineIssue existing = medicineIssueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine issue record not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin gets global edit access
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(existing.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Medicine issue record belongs to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Only ASHA workers and Admins can update medicine issue records");
        }

        existing.setPatientId(updateData.getPatientId());
        existing.setPatientName(updateData.getPatientName());
        existing.setMedicineName(updateData.getMedicineName());
        existing.setQuantity(updateData.getQuantity());
        existing.setDosageInstructions(updateData.getDosageInstructions());
        existing.setIssueDate(updateData.getIssueDate());

        return medicineIssueRepository.save(existing);
    }

    public void deleteMedicineIssue(Long id) {
        MedicineIssue existing = medicineIssueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine issue record not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin gets global delete access
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(existing.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Medicine issue record belongs to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Only ASHA workers and Admins can delete medicine issue records");
        }

        existing.setActive(0);
        medicineIssueRepository.save(existing);
    }
}
