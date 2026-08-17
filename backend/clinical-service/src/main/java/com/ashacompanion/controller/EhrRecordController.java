package com.ashacompanion.controller;

import com.ashacompanion.entity.EhrRecord;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.EhrRecordRepository;
import com.ashacompanion.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/ehr-records")
public class EhrRecordController {

    private final EhrRecordRepository ehrRecordRepository;
    private final UserRepository userRepository;

    public EhrRecordController(EhrRecordRepository ehrRecordRepository, UserRepository userRepository) {
        this.ehrRecordRepository = ehrRecordRepository;
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

    @PostConstruct
    public void seedMockRecords() {
        if (ehrRecordRepository.count() == 0) {
            String defaultPhc = "PHC_N1_1786513619";

            EhrRecord rec1 = new EhrRecord();
            rec1.setRecordId("REC-001");
            rec1.setPatientName("Sunita Devi");
            rec1.setPatientAge(26);
            rec1.setPatientGender("F");
            rec1.setVillage("Madukkarai");
            rec1.setStatus("synced");
            rec1.setLastUpdated("2026-07-06 14:32");
            rec1.setDiagnosis("ANC 2nd Trimester Checkup - Normal");
            rec1.setTreatment("Folic Acid, Iron Supplements, Calcium advised");
            rec1.setWorkerId("ASHA-101");
            rec1.setType("maternal");
            rec1.setPhcFacility("Madukkarai PHC");
            rec1.setAshaName("Anjali Sharma");
            rec1.setPhcId(defaultPhc);
            rec1.setVerificationStatus("pending");
            ehrRecordRepository.save(rec1);

            EhrRecord rec2 = new EhrRecord();
            rec2.setRecordId("REC-002");
            rec2.setPatientName("Aarav Kumar");
            rec2.setPatientAge(1);
            rec2.setPatientGender("M");
            rec2.setVillage("Thondamuthur");
            rec2.setStatus("synced");
            rec2.setLastUpdated("2026-07-06 11:15");
            rec2.setDiagnosis("1st Measles & Rubella (MR) Vaccination");
            rec2.setTreatment("Administered 0.5ml subcutaneously. Post-vaccination fever counseling given.");
            rec2.setWorkerId("ASHA-102");
            rec2.setType("child_immunization");
            rec2.setPhcFacility("Thondamuthur PHC");
            rec2.setAshaName("Rajni Bala");
            rec2.setPhcId(defaultPhc);
            rec2.setVerificationStatus("pending");
            ehrRecordRepository.save(rec2);

            EhrRecord rec3 = new EhrRecord();
            rec3.setRecordId("REC-003");
            rec3.setPatientName("Ram Sharan");
            rec3.setPatientAge(52);
            rec3.setPatientGender("M");
            rec3.setVillage("Sulur");
            rec3.setStatus("pending");
            rec3.setLastUpdated("2026-07-07 09:45");
            rec3.setDiagnosis("NCD Screening - High Blood Pressure");
            rec3.setTreatment("BP 152/94 mmHg. Referred to PHC for Medical Officer consultation.");
            rec3.setWorkerId("ASHA-103");
            rec3.setType("ncd_screening");
            rec3.setPhcFacility("Sulur PHC");
            rec3.setAshaName("Kiran Devi");
            rec3.setPhcId(defaultPhc);
            rec3.setVerificationStatus("pending");
            ehrRecordRepository.save(rec3);

            EhrRecord rec4 = new EhrRecord();
            rec4.setRecordId("REC-004");
            rec4.setPatientName("Komal Gupta");
            rec4.setPatientAge(22);
            rec4.setPatientGender("F");
            rec4.setVillage("Madukkarai");
            rec4.setStatus("pending");
            rec4.setLastUpdated("2026-07-07 15:20");
            rec4.setDiagnosis("Mild Anaemia - Hb 10.2 g/dL");
            rec4.setTreatment("Iron-rich diet counseling. Standard iron-folic acid regimen started.");
            rec4.setWorkerId("ASHA-101");
            rec4.setType("maternal");
            rec4.setPhcFacility("Madukkarai PHC");
            rec4.setAshaName("Anjali Sharma");
            rec4.setPhcId(defaultPhc);
            rec4.setVerificationStatus("pending");
            ehrRecordRepository.save(rec4);
        }
    }

    @GetMapping
    public ResponseEntity<List<EhrRecord>> getAllRecords() {
        User currentUser = getCurrentUser();
        String role = currentUser.getRole();
        List<EhrRecord> records;

        if ("ADMIN".equals(role)) {
            records = ehrRecordRepository.findAll();
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            records = (phcId != null) ? ehrRecordRepository.findByPhcId(phcId) : List.of();
        } else {
            records = ehrRecordRepository.findByWorkerId(currentUser.getUsername());
        }

        return ResponseEntity.ok(records);
    }

    @PostMapping
    public ResponseEntity<EhrRecord> createRecord(@RequestBody EhrRecord record) {
        User currentUser = getCurrentUser();
        if (record.getPhcId() == null) {
            record.setPhcId(currentUser.getPhcId());
        }
        if (record.getWorkerId() == null) {
            record.setWorkerId(currentUser.getUsername());
        }
        EhrRecord saved = ehrRecordRepository.save(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<EhrRecord> updateRecord(@PathVariable String recordId, @RequestBody EhrRecord updateData) {
        User currentUser = getCurrentUser();
        EhrRecord existing = ehrRecordRepository.findByRecordId(recordId)
                .orElseThrow(() -> new IllegalArgumentException("EhrRecord not found with recordId: " + recordId));

        if ("PHC_SUPERVISOR".equals(currentUser.getRole())) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(existing.getPhcId())) {
                throw new AccessDeniedException("Access denied: Record belongs to another PHC");
            }
        }

        if (updateData.getVerificationStatus() != null) {
            existing.setVerificationStatus(updateData.getVerificationStatus());
        }
        if (updateData.getVerifiedBy() != null) {
            existing.setVerifiedBy(updateData.getVerifiedBy());
        }
        if (updateData.getVerifiedAt() != null) {
            existing.setVerifiedAt(updateData.getVerifiedAt());
        }
        if (updateData.getCorrectionNote() != null) {
            existing.setCorrectionNote(updateData.getCorrectionNote());
        }

        EhrRecord saved = ehrRecordRepository.save(existing);
        return ResponseEntity.ok(saved);
    }
}
