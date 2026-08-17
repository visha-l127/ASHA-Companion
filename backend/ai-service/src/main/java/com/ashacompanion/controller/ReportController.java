package com.ashacompanion.controller;

import com.ashacompanion.dto.*;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import com.ashacompanion.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    @GetMapping("/patients")
    public ResponseEntity<PatientReportDTO> getPatientReport() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(reportService.getPatientReport(currentUser));
    }

    @GetMapping("/maternal")
    public ResponseEntity<MaternalReportDTO> getMaternalReport() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(reportService.getMaternalReport(currentUser));
    }

    @GetMapping("/immunization")
    public ResponseEntity<ImmunizationReportDTO> getImmunizationReport() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(reportService.getImmunizationReport(currentUser));
    }

    @GetMapping("/nutrition")
    public ResponseEntity<NutritionReportDTO> getNutritionReport() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(reportService.getNutritionReport(currentUser));
    }

    @GetMapping("/medicines")
    public ResponseEntity<MedicineReportDTO> getMedicineReport() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(reportService.getMedicineReport(currentUser));
    }
}
