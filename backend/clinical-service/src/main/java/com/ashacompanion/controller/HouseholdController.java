package com.ashacompanion.controller;

import com.ashacompanion.dto.HouseholdRequestDTO;
import com.ashacompanion.dto.HouseholdResponseDTO;
import com.ashacompanion.service.HouseholdService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/households")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    @PostMapping
    public ResponseEntity<HouseholdResponseDTO> createHousehold(@Valid @RequestBody HouseholdRequestDTO request) {
        HouseholdResponseDTO response = householdService.createHousehold(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<HouseholdResponseDTO>> getAllHouseholds() {
        List<HouseholdResponseDTO> response = householdService.getAllHouseholds();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HouseholdResponseDTO> getHouseholdById(@PathVariable Long id) {
        HouseholdResponseDTO response = householdService.getHouseholdById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HouseholdResponseDTO> updateHousehold(
            @PathVariable Long id,
            @Valid @RequestBody HouseholdRequestDTO request) {
        HouseholdResponseDTO response = householdService.updateHousehold(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHousehold(@PathVariable Long id) {
        householdService.deleteHousehold(id);
        return ResponseEntity.noContent().build();
    }
}
