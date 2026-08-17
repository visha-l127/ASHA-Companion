package com.ashacompanion.controller;

import com.ashacompanion.entity.MedicineIssue;
import com.ashacompanion.service.MedicineIssueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/medicine-issues")
public class MedicineIssueController {

    private final MedicineIssueService medicineIssueService;

    public MedicineIssueController(MedicineIssueService medicineIssueService) {
        this.medicineIssueService = medicineIssueService;
    }

    @PostMapping
    public ResponseEntity<MedicineIssue> createMedicineIssue(@RequestBody MedicineIssue record) {
        MedicineIssue created = medicineIssueService.createMedicineIssue(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<MedicineIssue>> getAllMedicineIssues() {
        List<MedicineIssue> list = medicineIssueService.getAllMedicineIssues();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicineIssue>> getMedicineIssuesByPatientId(@PathVariable Long patientId) {
        List<MedicineIssue> list = medicineIssueService.getMedicineIssuesByPatientId(patientId);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineIssue> updateMedicineIssue(
            @PathVariable Long id,
            @RequestBody MedicineIssue record) {
        MedicineIssue updated = medicineIssueService.updateMedicineIssue(id, record);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicineIssue(@PathVariable Long id) {
        medicineIssueService.deleteMedicineIssue(id);
        return ResponseEntity.noContent().build();
    }
}
