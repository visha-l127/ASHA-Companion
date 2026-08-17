package com.ashacompanion.controller;

import com.ashacompanion.dto.VaccineRequestDTO;
import com.ashacompanion.dto.VaccineResponseDTO;
import com.ashacompanion.service.VaccineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vaccines")
public class VaccineController {

    private final VaccineService vaccineService;

    public VaccineController(VaccineService vaccineService) {
        this.vaccineService = vaccineService;
    }

    @PostMapping
    public ResponseEntity<VaccineResponseDTO> createVaccine(@Valid @RequestBody VaccineRequestDTO request) {
        VaccineResponseDTO response = vaccineService.createVaccine(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VaccineResponseDTO>> getAllVaccines() {
        List<VaccineResponseDTO> response = vaccineService.getAllVaccines();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VaccineResponseDTO> getVaccineById(@PathVariable Long id) {
        VaccineResponseDTO response = vaccineService.getVaccineById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VaccineResponseDTO> updateVaccine(
            @PathVariable Long id,
            @Valid @RequestBody VaccineRequestDTO request) {
        VaccineResponseDTO response = vaccineService.updateVaccine(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVaccine(@PathVariable Long id) {
        vaccineService.deactivateVaccine(id);
        return ResponseEntity.noContent().build();
    }
}
