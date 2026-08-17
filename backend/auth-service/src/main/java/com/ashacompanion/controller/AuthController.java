package com.ashacompanion.controller;

import com.ashacompanion.dto.LoginRequest;
import com.ashacompanion.dto.LoginResponse;
import com.ashacompanion.dto.UserResponseDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody User user) {
        User savedUser = authService.register(user);
        UserResponseDTO response = new UserResponseDTO(savedUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test/admin")
    public ResponseEntity<Map<String, String>> testAdmin() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin endpoint accessed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test/supervisor")
    public ResponseEntity<Map<String, String>> testSupervisor() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Supervisor endpoint accessed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test/asha")
    public ResponseEntity<Map<String, String>> testAsha() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "ASHA endpoint accessed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test/pharmacist")
    public ResponseEntity<Map<String, String>> testPharmacist() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pharmacist endpoint accessed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }

        String username = auth.getName();
        String newPassword = request.get("newPassword");
        String oldPassword = request.get("oldPassword");

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        authService.changePassword(username, oldPassword, newPassword);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated successfully");
        return ResponseEntity.ok(response);
    }
}