package com.ashacompanion.service;

import com.ashacompanion.dto.HouseholdRequestDTO;
import com.ashacompanion.dto.HouseholdResponseDTO;
import com.ashacompanion.entity.Household;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.HouseholdRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final UserRepository userRepository;

    public HouseholdService(HouseholdRepository householdRepository, UserRepository userRepository) {
        this.householdRepository = householdRepository;
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

    public HouseholdResponseDTO createHousehold(HouseholdRequestDTO request) {
        User currentUser = getCurrentUser();

        if (!"ASHA".equals(currentUser.getRole()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only ASHA workers and Admins can register households");
        }

        Household hh = new Household();
        hh.setHouseholdNumber(request.getHouseholdNumber());
        hh.setHeadName(request.getHeadName());
        hh.setVillage(request.getVillage());
        hh.setMembersCount(request.getMembersCount());
        hh.setCategory(request.getCategory());
        hh.setWaterSource(request.getWaterSource());
        hh.setToilet(request.getToilet() ? 1 : 0);
        hh.setAshaWorkerId(currentUser.getId());
        hh.setPhcId(currentUser.getPhcId());
        hh.setActive(1);

        Household saved = householdRepository.save(hh);
        return new HouseholdResponseDTO(saved);
    }

    public List<HouseholdResponseDTO> getAllHouseholds() {
        User currentUser = getCurrentUser();
        List<Household> households;

        if ("ADMIN".equals(currentUser.getRole())) {
            households = householdRepository.findByActive(1);
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                households = List.of();
            } else {
                households = householdRepository.findByPhcIdAndActive(phcId, 1);
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            households = householdRepository.findByAshaWorkerIdAndActive(currentUser.getId(), 1);
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return households.stream()
                .map(HouseholdResponseDTO::new)
                .collect(Collectors.toList());
    }

    public HouseholdResponseDTO getHouseholdById(Long id) {
        Household hh = householdRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can read all
        } else if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(hh.getPhcId())) {
                throw new AccessDeniedException("Access denied: Household belongs to another PHC");
            }
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(hh.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Household is assigned to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return new HouseholdResponseDTO(hh);
    }

    public HouseholdResponseDTO updateHousehold(Long id, HouseholdRequestDTO request) {
        Household hh = householdRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can edit all
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(hh.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Household belongs to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Only ASHA workers and Admins can update households");
        }

        hh.setHouseholdNumber(request.getHouseholdNumber());
        hh.setHeadName(request.getHeadName());
        hh.setVillage(request.getVillage());
        hh.setMembersCount(request.getMembersCount());
        hh.setCategory(request.getCategory());
        hh.setWaterSource(request.getWaterSource());
        hh.setToilet(request.getToilet() ? 1 : 0);

        Household saved = householdRepository.save(hh);
        return new HouseholdResponseDTO(saved);
    }

    public void deleteHousehold(Long id) {
        Household hh = householdRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + id));

        User currentUser = getCurrentUser();

        if ("ADMIN".equals(currentUser.getRole())) {
            // Admin can delete all
        } else if ("ASHA".equals(currentUser.getRole())) {
            if (!currentUser.getId().equals(hh.getAshaWorkerId())) {
                throw new AccessDeniedException("Access denied: Household belongs to another ASHA worker");
            }
        } else {
            throw new AccessDeniedException("Access denied: Only ASHA workers and Admins can delete households");
        }

        hh.setActive(0);
        householdRepository.save(hh);
    }
}
