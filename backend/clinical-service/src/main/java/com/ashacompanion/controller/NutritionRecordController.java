package com.ashacompanion.controller;

import com.ashacompanion.dto.NutritionRecordRequestDTO;
import com.ashacompanion.dto.NutritionRecordResponseDTO;
import com.ashacompanion.service.NutritionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class NutritionRecordController {

    private final NutritionService nutritionService;

    public NutritionRecordController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @PostMapping("/nutrition-records")
    public ResponseEntity<NutritionRecordResponseDTO> createNutritionRecord(
            @Valid @RequestBody NutritionRecordRequestDTO request) {
        NutritionRecordResponseDTO response = nutritionService.createNutritionRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/nutrition-records")
    public ResponseEntity<List<NutritionRecordResponseDTO>> getAllNutritionRecords() {
        List<NutritionRecordResponseDTO> response = nutritionService.getAllNutritionRecords();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nutrition-records/high-risk")
    public ResponseEntity<List<NutritionRecordResponseDTO>> getHighRiskNutritionRecords() {
        List<NutritionRecordResponseDTO> response = nutritionService.getHighRiskNutritionRecords();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nutrition-records/{id}")
    public ResponseEntity<NutritionRecordResponseDTO> getNutritionRecordById(@PathVariable Long id) {
        NutritionRecordResponseDTO response = nutritionService.getNutritionRecordById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping({"/patients/{patientId}/nutrition-records", "/nutrition-records/patient/{patientId}"})
    public ResponseEntity<List<NutritionRecordResponseDTO>> getPatientNutritionHistory(@PathVariable Long patientId) {
        List<NutritionRecordResponseDTO> response = nutritionService.getPatientNutritionHistory(patientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patients/{patientId}/nutrition-records/latest")
    public ResponseEntity<NutritionRecordResponseDTO> getPatientLatestNutritionRecord(@PathVariable Long patientId) {
        NutritionRecordResponseDTO response = nutritionService.getPatientLatestNutritionRecord(patientId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/nutrition-records/{id}")
    public ResponseEntity<NutritionRecordResponseDTO> updateNutritionRecord(
            @PathVariable Long id,
            @RequestBody com.ashacompanion.dto.NutritionRecordUpdateRequestDTO request) {
        NutritionRecordResponseDTO response = nutritionService.updateNutritionRecord(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/nutrition-records/{id}")
    public ResponseEntity<Void> deleteNutritionRecord(@PathVariable Long id) {
        nutritionService.deleteNutritionRecord(id);
        return ResponseEntity.noContent().build();
    }
}
