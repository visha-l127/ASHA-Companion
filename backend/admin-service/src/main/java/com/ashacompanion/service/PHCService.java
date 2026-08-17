package com.ashacompanion.service;

import com.ashacompanion.dto.PHCRequestDTO;
import com.ashacompanion.dto.PHCResponseDTO;
import com.ashacompanion.entity.PHC;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.DuplicatePhcCodeException;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.PHCRepository;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PHCService {

    private final PHCRepository phcRepository;
    private final UserRepository userRepository;

    public PHCService(PHCRepository phcRepository, UserRepository userRepository) {
        this.phcRepository = phcRepository;
        this.userRepository = userRepository;
    }

    public PHCResponseDTO createPHC(PHCRequestDTO request) {
        if (phcRepository.existsByCode(request.getCode())) {
            throw new DuplicatePhcCodeException("PHC code already exists: " + request.getCode());
        }

        PHC phc = new PHC(
                request.getName(),
                request.getCode(),
                request.getDistrict(),
                request.getBlock(),
                request.getAddress()
        );

        PHC savedPhc = phcRepository.save(phc);
        return new PHCResponseDTO(savedPhc);
    }

    public List<PHCResponseDTO> getAllPHCs() {
        return phcRepository.findAll().stream()
                .map(PHCResponseDTO::new)
                .collect(Collectors.toList());
    }

    public PHCResponseDTO getPHCById(Long id) {
        PHC phc = phcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with ID: " + id));

        // Enforce fine-grained authorization for PHC_SUPERVISOR
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isSupervisor = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));

            if (isSupervisor && !isAdmin) {
                User currentUser = userRepository.findByUsername(auth.getName())
                        .orElseThrow(() -> new AccessDeniedException("Access denied"));
                if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(phc.getCode())) {
                    throw new AccessDeniedException("Access denied: Cannot access another PHC");
                }
            }
        }

        return new PHCResponseDTO(phc);
    }

    public PHCResponseDTO updatePHC(Long id, PHCRequestDTO request) {
        PHC phc = phcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with ID: " + id));

        if (!phc.getCode().equals(request.getCode()) && phcRepository.existsByCode(request.getCode())) {
            throw new DuplicatePhcCodeException("PHC code already exists: " + request.getCode());
        }

        phc.setName(request.getName());
        phc.setCode(request.getCode());
        phc.setDistrict(request.getDistrict());
        phc.setBlock(request.getBlock());
        phc.setAddress(request.getAddress());

        PHC savedPhc = phcRepository.save(phc);
        return new PHCResponseDTO(savedPhc);
    }

    public void deletePHC(Long id) {
        PHC phc = phcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with ID: " + id));
        phcRepository.delete(phc);
    }
}
