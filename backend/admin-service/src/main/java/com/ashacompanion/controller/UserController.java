package com.ashacompanion.controller;

import com.ashacompanion.dto.UserCreationRequestDTO;
import com.ashacompanion.dto.UserUpdateRequestDTO;
import com.ashacompanion.dto.UserResponseDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.DuplicateUsernameException;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.PHCRepository;
import com.ashacompanion.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PHCRepository phcRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PHCRepository phcRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.phcRepository = phcRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserCreationRequestDTO request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSupervisor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));

        String requestedRole = request.getRole() != null ? request.getRole().toUpperCase() : "";

        if (isAdmin) {
            // ADMIN can create PHC_SUPERVISOR accounts only
            if (!"PHC_SUPERVISOR".equalsIgnoreCase(requestedRole)) {
                throw new AccessDeniedException("Access denied: Administrators can only create PHC Supervisor accounts");
            }
        } else if (isSupervisor) {
            // PHC_SUPERVISOR can create ASHA workers and PHARMACIST accounts only for their assigned PHC
            if (!"ASHA".equalsIgnoreCase(requestedRole) && !"PHARMACIST".equalsIgnoreCase(requestedRole)) {
                throw new AccessDeniedException("Access denied: PHC Supervisors can only create ASHA workers and Pharmacists");
            }
            if (currentUser.getPhcId() == null || currentUser.getPhcId().trim().isEmpty()) {
                throw new AccessDeniedException("Access denied: Supervisor is not assigned to any PHC");
            }
            // Strict PHC Isolation: Always force supervisor's assigned PHC
            request.setPhcId(currentUser.getPhcId());
        } else {
            // PHARMACIST, ASHA, and other roles are strictly DENIED
            throw new AccessDeniedException("Access denied: Insufficient privileges to create users");
        }

        // Standardize role string uppercase
        request.setRole(requestedRole);

        // Validate PHC if specified
        if (request.getPhcId() != null && !request.getPhcId().trim().isEmpty()) {
            boolean exists = phcRepository.existsByCode(request.getPhcId());
            if (!exists) {
                try {
                    Long phcNumId = Long.parseLong(request.getPhcId());
                    exists = phcRepository.existsById(phcNumId);
                } catch (NumberFormatException ignored) {}
            }
            if (!exists) {
                throw new ResourceNotFoundException("PHC not found with code/ID: " + request.getPhcId());
            }
        }

        Optional<User> existingUserOpt = userRepository.findByUsername(request.getUsername());
        User user;
        HttpStatus status;

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            boolean isSamePhc = isAdmin || (currentUser.getPhcId() != null && currentUser.getPhcId().equals(existingUser.getPhcId()));
            boolean isSameRole = requestedRole.equalsIgnoreCase(existingUser.getRole());

            if (isSamePhc && isSameRole) {
                // Re-provisioning / password update for existing user in same PHC
                existingUser.setName(request.getName());
                existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
                if (request.getPhcId() != null && !request.getPhcId().trim().isEmpty()) {
                    existingUser.setPhcId(request.getPhcId());
                }
                if (request.getPhone() != null) {
                    existingUser.setPhone(request.getPhone());
                }
                user = userRepository.save(existingUser);
                status = HttpStatus.OK;
            } else {
                throw new DuplicateUsernameException("Username already exists: " + request.getUsername());
            }
        } else {
            user = new User();
            user.setName(request.getName());
            user.setUsername(request.getUsername());
            user.setRole(request.getRole());
            user.setPhcId(request.getPhcId());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }
            user.setStatus("active");
            user = userRepository.save(user);
            status = HttpStatus.CREATED;
        }

        return new ResponseEntity<>(new UserResponseDTO(user), status);
    }

    @GetMapping("/asha")
    public ResponseEntity<List<UserResponseDTO>> getAllAshaWorkers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSupervisor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));

        List<User> ashaWorkers;
        if (isAdmin) {
            ashaWorkers = userRepository.findByRole("ASHA");
        } else if (isSupervisor) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                ashaWorkers = List.of();
            } else {
                ashaWorkers = userRepository.findByRoleAndPhcId("ASHA", phcId);
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        List<UserResponseDTO> response = ashaWorkers.stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/asha/{id}")
    public ResponseEntity<UserResponseDTO> getAshaWorkerById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ASHA worker not found with ID: " + id));

        if (!"ASHA".equalsIgnoreCase(targetUser.getRole())) {
            throw new ResourceNotFoundException("ASHA worker not found with ID: " + id);
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSupervisor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));

        if (isSupervisor && !isAdmin) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(targetUser.getPhcId())) {
                throw new AccessDeniedException("Access denied: Cannot access ASHA worker from another PHC");
            }
        } else if (!isAdmin) {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        return ResponseEntity.ok(new UserResponseDTO(targetUser));
    }

    @GetMapping("/pharmacists")
    public ResponseEntity<List<UserResponseDTO>> getAllPharmacists() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSupervisor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));

        List<User> pharmacists;
        if (isAdmin) {
            pharmacists = userRepository.findByRole("PHARMACIST");
        } else if (isSupervisor) {
            String phcId = currentUser.getPhcId();
            if (phcId == null || phcId.trim().isEmpty()) {
                pharmacists = List.of();
            } else {
                pharmacists = userRepository.findByRoleAndPhcId("PHARMACIST", phcId);
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        List<UserResponseDTO> response = pharmacists.stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSupervisor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));
        boolean isPharmacist = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHARMACIST"));
        boolean isAsha = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ASHA"));

        List<User> users;
        if (isAdmin) {
            users = userRepository.findAll();
        } else if (isSupervisor || isPharmacist || isAsha) {
            if (currentUser.getPhcId() != null && !currentUser.getPhcId().trim().isEmpty()) {
                users = userRepository.findByPhcId(currentUser.getPhcId());
            } else {
                users = List.of();
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges");
        }

        List<UserResponseDTO> response = users.stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequestDTO request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSupervisor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (isAdmin) {
            // ADMIN can update PHC Supervisor accounts
            String userRole = user.getRole() != null ? user.getRole().toUpperCase() : "";
            if (!userRole.contains("SUPERVISOR") && !"PHC_SUPERVISOR".equalsIgnoreCase(user.getRole())) {
                throw new AccessDeniedException("Access denied: Administrators can only update PHC Supervisor accounts");
            }
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                user.setName(request.getName());
            }
            if (request.getPhcId() != null && !request.getPhcId().trim().isEmpty()) {
                boolean exists = phcRepository.existsByCode(request.getPhcId());
                if (!exists) {
                    try {
                        Long phcNumId = Long.parseLong(request.getPhcId());
                        exists = phcRepository.existsById(phcNumId);
                    } catch (NumberFormatException ignored) {}
                }
                if (!exists) {
                    throw new ResourceNotFoundException("PHC not found with code/ID: " + request.getPhcId());
                }
                user.setPhcId(request.getPhcId());
            }
            if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
                user.setStatus(request.getStatus().toLowerCase());
            }
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }
            if (request.getLocation() != null) {
                user.setLocation(request.getLocation());
            }
        } else if (isSupervisor) {
            // PHC_SUPERVISOR can update ASHA workers and PHARMACIST accounts belonging to their assigned PHC only
            if (!"ASHA".equalsIgnoreCase(user.getRole()) && !"PHARMACIST".equalsIgnoreCase(user.getRole())) {
                throw new AccessDeniedException("Access denied: PHC Supervisors can only update ASHA workers and Pharmacists");
            }
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(user.getPhcId())) {
                throw new AccessDeniedException("Access denied: Cannot update user from another PHC");
            }
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                user.setName(request.getName());
            }
            if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
                user.setStatus(request.getStatus().toLowerCase());
            }
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }
            if (request.getLocation() != null) {
                user.setLocation(request.getLocation());
            }
        } else {
            throw new AccessDeniedException("Access denied: Insufficient privileges to update users");
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(new UserResponseDTO(updatedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSupervisor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PHC_SUPERVISOR"));

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (isAdmin) {
            // ADMIN can delete PHC_SUPERVISOR accounts
            String userRole = user.getRole() != null ? user.getRole().toUpperCase() : "";
            if (!userRole.contains("SUPERVISOR") && !"PHC_SUPERVISOR".equalsIgnoreCase(user.getRole())) {
                throw new AccessDeniedException("Access denied: Administrators can only delete PHC Supervisor accounts");
            }
        } else if (isSupervisor) {
            // PHC_SUPERVISOR can delete ASHA workers and PHARMACIST accounts belonging to their assigned PHC only
            if (!"ASHA".equalsIgnoreCase(user.getRole()) && !"PHARMACIST".equalsIgnoreCase(user.getRole())) {
                throw new AccessDeniedException("Access denied: PHC Supervisors can only delete ASHA workers and Pharmacists");
            }
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(user.getPhcId())) {
                throw new AccessDeniedException("Access denied: Cannot delete user from another PHC");
            }
        } else {
            // PHARMACIST, ASHA, and other roles are strictly DENIED
            throw new AccessDeniedException("Access denied: Insufficient privileges to delete users");
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDTO> getProfile(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + auth.getName()));
        return ResponseEntity.ok(new UserResponseDTO(user));
    }
}
