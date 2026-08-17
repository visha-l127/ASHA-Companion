package com.ashacompanion.controller;

import com.ashacompanion.dto.AntenatalVisitRequestDTO;
import com.ashacompanion.dto.AntenatalVisitResponseDTO;
import com.ashacompanion.service.AntenatalVisitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AntenatalVisitController {

    private final AntenatalVisitService antenatalVisitService;

    public AntenatalVisitController(AntenatalVisitService antenatalVisitService) {
        this.antenatalVisitService = antenatalVisitService;
    }

    @PostMapping("/pregnancies/{pregnancyId}/visits")
    public ResponseEntity<AntenatalVisitResponseDTO> createVisit(
            @PathVariable Long pregnancyId,
            @Valid @RequestBody AntenatalVisitRequestDTO request) {
        AntenatalVisitResponseDTO response = antenatalVisitService.createVisit(pregnancyId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/pregnancies/{pregnancyId}/visits")
    public ResponseEntity<List<AntenatalVisitResponseDTO>> getVisitsByPregnancyId(@PathVariable Long pregnancyId) {
        List<AntenatalVisitResponseDTO> response = antenatalVisitService.getVisitsByPregnancyId(pregnancyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/antenatal-visits/{id}")
    public ResponseEntity<AntenatalVisitResponseDTO> getVisitById(@PathVariable Long id) {
        AntenatalVisitResponseDTO response = antenatalVisitService.getVisitById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/antenatal-visits")
    public ResponseEntity<List<AntenatalVisitResponseDTO>> getAllVisits() {
        List<AntenatalVisitResponseDTO> response = antenatalVisitService.getAllVisits();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/antenatal-visits/{id}")
    public ResponseEntity<AntenatalVisitResponseDTO> updateVisit(
            @PathVariable Long id,
            @Valid @RequestBody AntenatalVisitRequestDTO request) {
        AntenatalVisitResponseDTO response = antenatalVisitService.updateVisit(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/antenatal-visits/{id}")
    public ResponseEntity<Void> deleteVisit(@PathVariable Long id) {
        antenatalVisitService.deleteVisit(id);
        return ResponseEntity.noContent().build();
    }
}
