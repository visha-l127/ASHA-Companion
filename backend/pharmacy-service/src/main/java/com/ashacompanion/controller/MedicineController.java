package com.ashacompanion.controller;

import com.ashacompanion.dto.MedicineRequestDTO;
import com.ashacompanion.dto.MedicineResponseDTO;
import com.ashacompanion.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public ResponseEntity<MedicineResponseDTO> createMedicine(@Valid @RequestBody MedicineRequestDTO request) {
        MedicineResponseDTO response = medicineService.createMedicine(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineResponseDTO> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequestDTO request) {
        MedicineResponseDTO response = medicineService.updateMedicine(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateMedicine(@PathVariable Long id) {
        medicineService.deactivateMedicine(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponseDTO> getMedicineById(@PathVariable Long id) {
        MedicineResponseDTO response = medicineService.getMedicineById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MedicineResponseDTO>> getAllMedicines() {
        List<MedicineResponseDTO> response = medicineService.getAllMedicines();
        return ResponseEntity.ok(response);
    }
}
