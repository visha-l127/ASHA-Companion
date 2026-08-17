package com.ashacompanion.controller;

import com.ashacompanion.dto.ImmunizationRequestDTO;
import com.ashacompanion.dto.ImmunizationResponseDTO;
import com.ashacompanion.dto.ImmunizationSummaryDTO;
import com.ashacompanion.service.ImmunizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/immunizations")
public class ImmunizationController {

    private final ImmunizationService immunizationService;

    public ImmunizationController(ImmunizationService immunizationService) {
        this.immunizationService = immunizationService;
    }

    @PostMapping
    public ResponseEntity<ImmunizationResponseDTO> createImmunization(
            @Valid @RequestBody ImmunizationRequestDTO request) {
        ImmunizationResponseDTO response = immunizationService.createImmunization(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ImmunizationResponseDTO>> getPatientImmunizations(@PathVariable Long patientId) {
        List<ImmunizationResponseDTO> response = immunizationService.getPatientImmunizations(patientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImmunizationResponseDTO> getImmunizationById(@PathVariable Long id) {
        ImmunizationResponseDTO response = immunizationService.getImmunizationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}/summary")
    public ResponseEntity<ImmunizationSummaryDTO> getImmunizationSummary(@PathVariable Long patientId) {
        ImmunizationSummaryDTO response = immunizationService.getImmunizationSummary(patientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<ImmunizationResponseDTO>> getUpcomingImmunizations() {
        List<ImmunizationResponseDTO> response = immunizationService.getUpcomingImmunizations();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<ImmunizationResponseDTO>> getOverdueImmunizations() {
        List<ImmunizationResponseDTO> response = immunizationService.getOverdueImmunizations();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImmunizationResponseDTO> updateImmunization(
            @PathVariable Long id,
            @Valid @RequestBody ImmunizationRequestDTO request) {
        ImmunizationResponseDTO response = immunizationService.updateImmunization(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImmunization(@PathVariable Long id) {
        immunizationService.deleteImmunization(id);
        return ResponseEntity.noContent().build();
    }
}
