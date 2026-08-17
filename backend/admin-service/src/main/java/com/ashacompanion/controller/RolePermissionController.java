package com.ashacompanion.controller;

import com.ashacompanion.entity.RolePermission;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.RolePermissionRepository;
import com.ashacompanion.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;

@RestController
@RequestMapping("/roles")
public class RolePermissionController {

    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;

    public RolePermissionController(RolePermissionRepository rolePermissionRepository, UserRepository userRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void seedDefaultRoles() {
        if (rolePermissionRepository.count() == 0) {
            rolePermissionRepository.save(new RolePermission(
                "admin",
                "District level system administrator with full access",
                Arrays.asList("view_dashboard", "manage_phc", "manage_users", "manage_roles", "view_reports", "manage_settings", "view_audits")
            ));
            rolePermissionRepository.save(new RolePermission(
                "supervisor",
                "Medical Officer or Sector Supervisor overseeing cluster PHCs/Sub-Centers",
                Arrays.asList("view_dashboard", "view_reports", "manage_users")
            ));
            rolePermissionRepository.save(new RolePermission(
                "asha",
                "Accredited Social Health Activist volunteer inputting village records offline",
                Arrays.asList("view_dashboard")
            ));
            rolePermissionRepository.save(new RolePermission(
                "pharmacist",
                "Sub-Center pharmacist checking cold-chain and dispensing vaccine inventory",
                Arrays.asList("view_dashboard")
            ));
            System.out.println("Default roles successfully seeded in role_permissions table.");
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    private void verifyAdmin() {
        User currentUser = getCurrentUser();
        if (!"ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied: Only administrators can modify access roles");
        }
    }

    @GetMapping
    public ResponseEntity<List<RolePermission>> getAllRoles() {
        // Any authenticated user can read roles for permission matrices
        getCurrentUser();
        return ResponseEntity.ok(rolePermissionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<RolePermission> createRole(@RequestBody RolePermission role) {
        verifyAdmin();
        if (role.getRole() == null || role.getRole().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        role.setRole(role.getRole().toLowerCase().trim().replace(" ", "-"));
        if (rolePermissionRepository.findByRole(role.getRole()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        RolePermission saved = rolePermissionRepository.save(role);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RolePermission> updateRole(@PathVariable Long id, @RequestBody RolePermission role) {
        verifyAdmin();
        RolePermission existing = rolePermissionRepository.findById(id)
                .orElseThrow(() -> new com.ashacompanion.exception.ResourceNotFoundException("Role not found with id: " + id));

        existing.setDescription(role.getDescription());
        existing.setPermissions(role.getPermissions());
        // Do not change the role name slug as it is referenced elsewhere
        RolePermission saved = rolePermissionRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        verifyAdmin();
        RolePermission existing = rolePermissionRepository.findById(id)
                .orElseThrow(() -> new com.ashacompanion.exception.ResourceNotFoundException("Role not found with id: " + id));

        // Prevent deleting core system roles
        List<String> coreRoles = Arrays.asList("admin", "supervisor", "asha", "pharmacist");
        if (coreRoles.contains(existing.getRole().toLowerCase())) {
            throw new AccessDeniedException("Access denied: Cannot delete built-in system roles");
        }

        rolePermissionRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
