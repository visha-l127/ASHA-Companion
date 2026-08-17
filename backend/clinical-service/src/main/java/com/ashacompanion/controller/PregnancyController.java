package com.ashacompanion.controller;

import com.ashacompanion.dto.PregnancyRequestDTO;
import com.ashacompanion.dto.PregnancyResponseDTO;
import com.ashacompanion.service.PregnancyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pregnancies")
public class PregnancyController {

    private final PregnancyService pregnancyService;

    public PregnancyController(PregnancyService pregnancyService) {
        this.pregnancyService = pregnancyService;
    }

    @PostMapping
    public ResponseEntity<PregnancyResponseDTO> createPregnancy(@Valid @RequestBody PregnancyRequestDTO request) {
        PregnancyResponseDTO response = pregnancyService.createPregnancy(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PregnancyResponseDTO>> getAllPregnancies() {
        List<PregnancyResponseDTO> response = pregnancyService.getAllPregnancies();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<PregnancyResponseDTO>> getHighRiskPregnancies() {
        List<PregnancyResponseDTO> response = pregnancyService.getHighRiskPregnancies();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PregnancyResponseDTO> getPregnancyById(@PathVariable Long id) {
        PregnancyResponseDTO response = pregnancyService.getPregnancyById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PregnancyResponseDTO> updatePregnancy(
            @PathVariable Long id,
            @Valid @RequestBody PregnancyRequestDTO request) {
        PregnancyResponseDTO response = pregnancyService.updatePregnancy(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PregnancyResponseDTO> changePregnancyStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        PregnancyResponseDTO response = pregnancyService.changePregnancyStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePregnancy(@PathVariable Long id) {
        pregnancyService.deletePregnancy(id);
        return ResponseEntity.noContent().build();
    }
}
