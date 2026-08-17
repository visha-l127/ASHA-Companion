package com.ashacompanion.controller;

import com.ashacompanion.dto.PHCRequestDTO;
import com.ashacompanion.dto.PHCResponseDTO;
import com.ashacompanion.service.PHCService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/phcs")
public class PHCController {

    private final PHCService phcService;

    public PHCController(PHCService phcService) {
        this.phcService = phcService;
    }

    @PostMapping
    public ResponseEntity<PHCResponseDTO> createPHC(@Valid @RequestBody PHCRequestDTO request) {
        PHCResponseDTO response = phcService.createPHC(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PHCResponseDTO>> getAllPHCs() {
        List<PHCResponseDTO> response = phcService.getAllPHCs();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PHCResponseDTO> getPHCById(@PathVariable Long id) {
        PHCResponseDTO response = phcService.getPHCById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PHCResponseDTO> updatePHC(
            @PathVariable Long id,
            @Valid @RequestBody PHCRequestDTO request) {
        PHCResponseDTO response = phcService.updatePHC(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePHC(@PathVariable Long id) {
        phcService.deletePHC(id);
        return ResponseEntity.noContent().build();
    }
}
