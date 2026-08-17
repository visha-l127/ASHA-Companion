package com.ashacompanion.controller;

import com.ashacompanion.entity.*;
import com.ashacompanion.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/internal")
public class InternalClinicalController {
    private final PatientRepository patientRepository;
    private final PregnancyRepository pregnancyRepository;
    private final AntenatalVisitRepository antenatalVisitRepository;
    private final ImmunizationRecordRepository immunizationRecordRepository;
    private final NutritionRecordRepository nutritionRecordRepository;
    private final PriorityVisitRepository priorityVisitRepository;

    public InternalClinicalController(
        PatientRepository patientRepository,
        PregnancyRepository pregnancyRepository,
        AntenatalVisitRepository antenatalVisitRepository,
        ImmunizationRecordRepository immunizationRecordRepository,
        NutritionRecordRepository nutritionRecordRepository,
        PriorityVisitRepository priorityVisitRepository
    ) {
        this.patientRepository = patientRepository;
        this.pregnancyRepository = pregnancyRepository;
        this.antenatalVisitRepository = antenatalVisitRepository;
        this.immunizationRecordRepository = immunizationRecordRepository;
        this.nutritionRecordRepository = nutritionRecordRepository;
        this.priorityVisitRepository = priorityVisitRepository;
    }

    @GetMapping("/patients")
    public List<Patient> getPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/patients/phc/{phcId}")
    public List<Patient> getPatientsByPhc(@PathVariable String phcId) {
        return patientRepository.findByPhcId(phcId);
    }

    @GetMapping("/patients/asha/{workerId}")
    public List<Patient> getPatientsByAsha(@PathVariable Long workerId) {
        return patientRepository.findByAshaWorkerId(workerId);
    }

    @GetMapping("/patients/{id}")
    public Patient getPatient(@PathVariable Long id) {
        return patientRepository.findById(id).orElse(null);
    }

    @GetMapping("/pregnancies/{id}")
    public Pregnancy getPregnancy(@PathVariable Long id) {
        return pregnancyRepository.findById(id).orElse(null);
    }

    @GetMapping("/pregnancies/patient/{patientId}")
    public List<Pregnancy> getPregnanciesByPatientId(@PathVariable Long patientId) {
        return pregnancyRepository.findByPatientId(patientId);
    }

    @GetMapping("/antenatal-visits/pregnancy/{pregnancyId}")
    public List<AntenatalVisit> getVisits(@PathVariable Long pregnancyId) {
        return antenatalVisitRepository.findByPregnancyId(pregnancyId);
    }

    @GetMapping("/immunizations/patient/{patientId}")
    public List<ImmunizationRecord> getImmunizations(@PathVariable Long patientId) {
        return immunizationRecordRepository.findByPatientId(patientId);
    }

    @GetMapping("/nutrition-records/patient/{patientId}")
    public List<NutritionRecord> getNutritionRecords(@PathVariable Long patientId) {
        return nutritionRecordRepository.findByPatientIdOrderByMeasurementDateDesc(patientId);
    }

    @GetMapping("/immunizations")
    public List<ImmunizationRecord> getAllImmunizations() {
        return immunizationRecordRepository.findAll();
    }

    @GetMapping("/nutrition-records")
    public List<NutritionRecord> getAllNutritionRecords() {
        return nutritionRecordRepository.findAll();
    }

    @GetMapping("/maternal/high-risk-count")
    public long getHighRiskMaternalCount() {
        return pregnancyRepository.findAll().stream().filter(Pregnancy::isHighRisk).count();
    }

    @GetMapping("/immunization/defaulter-count")
    public long getImmunizationDefaulterCount() {
        return immunizationRecordRepository.findAll().stream().filter(im -> !im.isAdministered()).count();
    }

    @GetMapping("/nutrition/risk-count")
    public long getNutritionRiskCount() {
        return nutritionRecordRepository.findAll().stream().filter(NutritionRecord::isRiskFlag).count();
    }

    @GetMapping("/pregnancies")
    public List<Pregnancy> getAllPregnancies() {
        return pregnancyRepository.findAll();
    }

    @GetMapping("/pregnancies/phc/{phcId}")
    public List<Pregnancy> getPregnanciesByPhc(@PathVariable String phcId) {
        return pregnancyRepository.findByPatientPhcId(phcId);
    }

    @GetMapping("/pregnancies/asha/{ashaWorkerId}")
    public List<Pregnancy> getPregnanciesByAsha(@PathVariable Long ashaWorkerId) {
        return pregnancyRepository.findByPatientAshaWorkerId(ashaWorkerId);
    }

    @GetMapping("/immunizations/phc/{phcId}")
    public List<ImmunizationRecord> getImmunizationsByPhc(@PathVariable String phcId) {
        return immunizationRecordRepository.findByPatientPhcId(phcId);
    }

    @GetMapping("/immunizations/asha/{ashaWorkerId}")
    public List<ImmunizationRecord> getImmunizationsByAsha(@PathVariable Long ashaWorkerId) {
        return immunizationRecordRepository.findByPatientAshaWorkerId(ashaWorkerId);
    }

    @GetMapping("/nutrition-records/phc/{phcId}")
    public List<NutritionRecord> getNutritionRecordsByPhc(@PathVariable String phcId) {
        return nutritionRecordRepository.findByPatientPhcId(phcId);
    }

    @GetMapping("/nutrition-records/asha/{ashaWorkerId}")
    public List<NutritionRecord> getNutritionRecordsByAsha(@PathVariable Long ashaWorkerId) {
        return nutritionRecordRepository.findByPatientAshaWorkerId(ashaWorkerId);
    }

    @GetMapping("/priority-visits")
    public List<PriorityVisit> getAllPriorityVisits() {
        return priorityVisitRepository.findAll();
    }
}
