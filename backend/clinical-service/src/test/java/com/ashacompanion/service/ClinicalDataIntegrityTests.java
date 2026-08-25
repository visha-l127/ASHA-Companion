package com.ashacompanion.service;

import com.ashacompanion.dto.ImmunizationRequestDTO;
import com.ashacompanion.dto.ImmunizationResponseDTO;
import com.ashacompanion.dto.NutritionRecordRequestDTO;
import com.ashacompanion.dto.NutritionRecordResponseDTO;
import com.ashacompanion.dto.PregnancyResponseDTO;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.AdministeredImmunizationDeletionException;
import com.ashacompanion.exception.AdministeredImmunizationModificationException;
import com.ashacompanion.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClinicalDataIntegrityTests {

    @Mock
    private NutritionRecordRepository nutritionRecordRepository;
    @Mock
    private ImmunizationRecordRepository immunizationRecordRepository;
    @Mock
    private PregnancyRepository pregnancyRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private VaccineRepository vaccineRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NutritionService nutritionService;
    @InjectMocks
    private ImmunizationService immunizationService;
    @InjectMocks
    private PregnancyService pregnancyService;

    private User adminUser;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setRole("ADMIN");

        testPatient = new Patient();
        testPatient.setId(100L);
        testPatient.setName("Test Patient");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "pass")
        );
        lenient().when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
    }

    // ==========================================
    // FIX 1: NUTRITION RECORDS SOFT DELETE TESTS
    // ==========================================

    @Test
    void testNutritionRecordCreationSetsActive() {
        when(patientRepository.findById(100L)).thenReturn(Optional.of(testPatient));
        when(nutritionRecordRepository.save(any(NutritionRecord.class))).thenAnswer(inv -> {
            NutritionRecord r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });

        NutritionRecordRequestDTO req = new NutritionRecordRequestDTO();
        req.setPatientId(100L);
        req.setMeasurementDate(LocalDate.now());
        req.setWeightKg(45.0);
        req.setHeightCm(150.0);
        req.setMuacCm(22.0);
        req.setAgeMonths(120);

        NutritionRecordResponseDTO res = nutritionService.createNutritionRecord(req);
        assertNotNull(res);

        ArgumentCaptor<NutritionRecord> captor = ArgumentCaptor.forClass(NutritionRecord.class);
        verify(nutritionRecordRepository).save(captor.capture());
        assertTrue(captor.getValue().isActive());
        assertEquals(1, captor.getValue().getActive());
    }

    @Test
    void testNutritionRecordDeleteIsSoftDelete() {
        NutritionRecord record = new NutritionRecord();
        record.setId(1L);
        record.setPatient(testPatient);
        record.setActive(true);

        when(nutritionRecordRepository.findById(1L)).thenReturn(Optional.of(record));

        nutritionService.deleteNutritionRecord(1L);

        assertFalse(record.isActive());
        assertEquals(0, record.getActive());
        verify(nutritionRecordRepository).save(record);
        verify(nutritionRecordRepository, never()).delete(any(NutritionRecord.class));
    }

    @Test
    void testNutritionRecordGetAllFiltersInactive() {
        NutritionRecord activeRecord = new NutritionRecord();
        activeRecord.setId(1L);
        activeRecord.setPatient(testPatient);
        activeRecord.setActive(true);

        NutritionRecord inactiveRecord = new NutritionRecord();
        inactiveRecord.setId(2L);
        inactiveRecord.setPatient(testPatient);
        inactiveRecord.setActive(false);

        when(nutritionRecordRepository.findAll()).thenReturn(Arrays.asList(activeRecord, inactiveRecord));

        List<NutritionRecordResponseDTO> result = nutritionService.getAllNutritionRecords();
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void testNutritionRecordGetPatientHistoryFiltersInactive() {
        when(patientRepository.findById(100L)).thenReturn(Optional.of(testPatient));

        NutritionRecord activeRecord = new NutritionRecord();
        activeRecord.setId(1L);
        activeRecord.setPatient(testPatient);
        activeRecord.setActive(true);

        NutritionRecord inactiveRecord = new NutritionRecord();
        inactiveRecord.setId(2L);
        inactiveRecord.setPatient(testPatient);
        inactiveRecord.setActive(false);

        when(nutritionRecordRepository.findByPatientIdOrderByMeasurementDateDesc(100L))
                .thenReturn(Arrays.asList(activeRecord, inactiveRecord));

        List<NutritionRecordResponseDTO> result = nutritionService.getPatientNutritionHistory(100L);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void testNutritionRecordGetLatestReturnsActiveOnly() {
        when(patientRepository.findById(100L)).thenReturn(Optional.of(testPatient));

        NutritionRecord inactiveNewer = new NutritionRecord();
        inactiveNewer.setId(2L);
        inactiveNewer.setPatient(testPatient);
        inactiveNewer.setMeasurementDate(LocalDate.now());
        inactiveNewer.setActive(false);

        NutritionRecord activeOlder = new NutritionRecord();
        activeOlder.setId(1L);
        activeOlder.setPatient(testPatient);
        activeOlder.setMeasurementDate(LocalDate.now().minusDays(10));
        activeOlder.setActive(true);

        when(nutritionRecordRepository.findByPatientIdOrderByMeasurementDateDesc(100L))
                .thenReturn(Arrays.asList(inactiveNewer, activeOlder));

        NutritionRecordResponseDTO result = nutritionService.getPatientLatestNutritionRecord(100L);
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void testNutritionRecordGetHighRiskFiltersInactive() {
        NutritionRecord activeRisk = new NutritionRecord();
        activeRisk.setId(1L);
        activeRisk.setPatient(testPatient);
        activeRisk.setActive(true);
        activeRisk.setRiskFlag(true);

        NutritionRecord inactiveRisk = new NutritionRecord();
        inactiveRisk.setId(2L);
        inactiveRisk.setPatient(testPatient);
        inactiveRisk.setActive(false);
        inactiveRisk.setRiskFlag(true);

        when(nutritionRecordRepository.findByRiskFlag(1)).thenReturn(Arrays.asList(activeRisk, inactiveRisk));

        List<NutritionRecordResponseDTO> result = nutritionService.getHighRiskNutritionRecords();
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    // ==========================================
    // FIX 2: IMMUNIZATION RESTRICT DELETE OF ADMINISTERED
    // ==========================================

    @Test
    void testDeleteNonAdministeredImmunizationSucceeds() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(10L);
        record.setPatient(testPatient);
        record.setAdministered(false);

        when(immunizationRecordRepository.findById(10L)).thenReturn(Optional.of(record));

        assertDoesNotThrow(() -> immunizationService.deleteImmunization(10L));
        verify(immunizationRecordRepository).delete(record);
    }

    @Test
    void testDeleteAdministeredImmunizationThrowsConflict() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(11L);
        record.setPatient(testPatient);
        record.setAdministered(true);

        when(immunizationRecordRepository.findById(11L)).thenReturn(Optional.of(record));

        AdministeredImmunizationDeletionException ex = assertThrows(
                AdministeredImmunizationDeletionException.class,
                () -> immunizationService.deleteImmunization(11L)
        );
        assertEquals("Cannot delete an administered immunization record.", ex.getMessage());
        verify(immunizationRecordRepository, never()).delete(any(ImmunizationRecord.class));
    }

    @Test
    void testUpdateNonAdministeredImmunizationSucceeds() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(12L);
        record.setPatient(testPatient);
        record.setAdministered(false);
        record.setDoseNumber(1);
        record.setNotes("Old note");

        when(immunizationRecordRepository.findById(12L)).thenReturn(Optional.of(record));
        when(immunizationRecordRepository.save(any(ImmunizationRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        ImmunizationRequestDTO req = new ImmunizationRequestDTO();
        req.setAdministered(false);
        req.setDoseNumber(2);
        req.setNotes("Updated note");

        ImmunizationResponseDTO res = immunizationService.updateImmunization(12L, req);
        assertNotNull(res);
        assertFalse(record.isAdministered());
        assertEquals(2, record.getDoseNumber());
        assertEquals("Updated note", record.getNotes());
        verify(immunizationRecordRepository).save(record);
    }

    @Test
    void testUpdateNonAdministeredToAdministeredSucceeds() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(13L);
        record.setPatient(testPatient);
        record.setAdministered(false);
        record.setDoseNumber(1);

        when(immunizationRecordRepository.findById(13L)).thenReturn(Optional.of(record));
        when(immunizationRecordRepository.save(any(ImmunizationRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        ImmunizationRequestDTO req = new ImmunizationRequestDTO();
        req.setAdministered(true);
        req.setAdministeredDate(LocalDate.now());
        req.setBatchNumber("BATCH-123");
        req.setDoseNumber(1);

        ImmunizationResponseDTO res = immunizationService.updateImmunization(13L, req);
        assertNotNull(res);
        assertTrue(record.isAdministered());
        assertEquals("BATCH-123", record.getBatchNumber());
        verify(immunizationRecordRepository).save(record);
    }

    @Test
    void testUpdateAdministeredImmunizationOtherFieldsSucceeds() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(14L);
        record.setPatient(testPatient);
        record.setAdministered(true);
        record.setAdministeredDate(LocalDate.now().minusDays(5));
        record.setBatchNumber("OLD-BATCH");
        record.setNotes("Old notes");
        record.setDoseNumber(1);

        when(immunizationRecordRepository.findById(14L)).thenReturn(Optional.of(record));
        when(immunizationRecordRepository.save(any(ImmunizationRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        ImmunizationRequestDTO req = new ImmunizationRequestDTO();
        req.setAdministered(true);
        req.setAdministeredDate(LocalDate.now().minusDays(5));
        req.setBatchNumber("NEW-BATCH");
        req.setNotes("Corrected notes");
        req.setDoseNumber(1);

        ImmunizationResponseDTO res = immunizationService.updateImmunization(14L, req);
        assertNotNull(res);
        assertTrue(record.isAdministered());
        assertEquals("NEW-BATCH", record.getBatchNumber());
        assertEquals("Corrected notes", record.getNotes());
        verify(immunizationRecordRepository).save(record);
    }

    @Test
    void testUpdateAdministeredImmunizationToNonAdministeredThrowsConflict() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(15L);
        record.setPatient(testPatient);
        record.setAdministered(true);
        record.setAdministeredDate(LocalDate.now().minusDays(10));
        record.setBatchNumber("BATCH-999");
        record.setDoseNumber(1);

        when(immunizationRecordRepository.findById(15L)).thenReturn(Optional.of(record));

        ImmunizationRequestDTO req = new ImmunizationRequestDTO();
        req.setAdministered(false);
        req.setDoseNumber(1);

        AdministeredImmunizationModificationException ex = assertThrows(
                AdministeredImmunizationModificationException.class,
                () -> immunizationService.updateImmunization(15L, req)
        );
        assertEquals("Cannot un-administer an immunization record that has already been administered.", ex.getMessage());
        assertTrue(record.isAdministered());
        verify(immunizationRecordRepository, never()).save(any(ImmunizationRecord.class));
    }

    @Test
    void testBypassAttemptPutThenDeleteBlockedAtPutStep() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(16L);
        record.setPatient(testPatient);
        record.setAdministered(true);
        record.setAdministeredDate(LocalDate.now().minusDays(2));
        record.setDoseNumber(1);

        when(immunizationRecordRepository.findById(16L)).thenReturn(Optional.of(record));

        ImmunizationRequestDTO bypassRequest = new ImmunizationRequestDTO();
        bypassRequest.setAdministered(false);

        // Step 1: PUT to unset administered fails with 409 Conflict
        assertThrows(
                AdministeredImmunizationModificationException.class,
                () -> immunizationService.updateImmunization(16L, bypassRequest)
        );

        // Verify record remains administered
        assertTrue(record.isAdministered());

        // Step 2: Subsequent DELETE is still blocked by administered check
        assertThrows(
                AdministeredImmunizationDeletionException.class,
                () -> immunizationService.deleteImmunization(16L)
        );
        verify(immunizationRecordRepository, never()).delete(any(ImmunizationRecord.class));
    }

    @Test
    void testUpdateAdministeredImmunizationWithOmittedAdministeredFieldThrowsConflict() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(17L);
        record.setPatient(testPatient);
        record.setAdministered(true);
        record.setAdministeredDate(LocalDate.now().minusDays(3));
        record.setDoseNumber(1);

        when(immunizationRecordRepository.findById(17L)).thenReturn(Optional.of(record));

        // When administered is omitted in JSON / DTO, the default value in DTO is false
        ImmunizationRequestDTO omittedAdministeredReq = new ImmunizationRequestDTO();
        assertEquals(Boolean.FALSE, omittedAdministeredReq.getAdministered());

        AdministeredImmunizationModificationException ex = assertThrows(
                AdministeredImmunizationModificationException.class,
                () -> immunizationService.updateImmunization(17L, omittedAdministeredReq)
        );
        assertEquals("Cannot un-administer an immunization record that has already been administered.", ex.getMessage());
        assertTrue(record.isAdministered());
        verify(immunizationRecordRepository, never()).save(any(ImmunizationRecord.class));
    }

    @Test
    void testUpdateAdministeredImmunizationWithExplicitNullAdministeredFieldThrowsConflict() {
        ImmunizationRecord record = new ImmunizationRecord();
        record.setId(18L);
        record.setPatient(testPatient);
        record.setAdministered(true);
        record.setAdministeredDate(LocalDate.now().minusDays(3));
        record.setDoseNumber(1);

        when(immunizationRecordRepository.findById(18L)).thenReturn(Optional.of(record));

        ImmunizationRequestDTO explicitNullReq = new ImmunizationRequestDTO();
        explicitNullReq.setAdministered(null);
        assertNull(explicitNullReq.getAdministered());

        // With the fix applied, explicit null is rejected with 409 Conflict, NOT 500 / NullPointerException
        AdministeredImmunizationModificationException ex = assertThrows(
                AdministeredImmunizationModificationException.class,
                () -> immunizationService.updateImmunization(18L, explicitNullReq)
        );
        assertEquals("Cannot un-administer an immunization record that has already been administered.", ex.getMessage());
        assertTrue(record.isAdministered());
        verify(immunizationRecordRepository, never()).save(any(ImmunizationRecord.class));
    }

    // ==========================================
    // FIX 3: PREGNANCY DELETE PRESERVES STATUS
    // ==========================================

    @Test
    void testDeletePregnancyPreservesStatusAndDeactivates() {
        Pregnancy pregnancy = new Pregnancy();
        pregnancy.setId(20L);
        pregnancy.setPatient(testPatient);
        pregnancy.setPregnancyStatus(PregnancyStatus.REGISTERED);
        pregnancy.setActive(true);

        when(pregnancyRepository.findById(20L)).thenReturn(Optional.of(pregnancy));

        pregnancyService.deletePregnancy(20L);

        assertFalse(pregnancy.isActive());
        assertEquals(PregnancyStatus.REGISTERED, pregnancy.getPregnancyStatus());
        assertNotEquals(PregnancyStatus.COMPLETED, pregnancy.getPregnancyStatus());
        verify(pregnancyRepository).save(pregnancy);
    }

    @Test
    void testGetAllPregnanciesFiltersInactive() {
        Pregnancy activePreg = new Pregnancy();
        activePreg.setId(1L);
        activePreg.setPatient(testPatient);
        activePreg.setActive(true);

        Pregnancy inactivePreg = new Pregnancy();
        inactivePreg.setId(2L);
        inactivePreg.setPatient(testPatient);
        inactivePreg.setActive(false);

        when(pregnancyRepository.findAll()).thenReturn(Arrays.asList(activePreg, inactivePreg));

        List<PregnancyResponseDTO> result = pregnancyService.getAllPregnancies();
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void testLegitimatePregnancyStatusChangeToCompleted() {
        Pregnancy pregnancy = new Pregnancy();
        pregnancy.setId(30L);
        pregnancy.setPatient(testPatient);
        pregnancy.setPregnancyStatus(PregnancyStatus.REGISTERED);
        pregnancy.setActive(true);

        when(pregnancyRepository.findById(30L)).thenReturn(Optional.of(pregnancy));
        when(pregnancyRepository.save(any(Pregnancy.class))).thenAnswer(inv -> inv.getArgument(0));

        PregnancyResponseDTO res = pregnancyService.changePregnancyStatus(30L, "COMPLETED");

        assertEquals("COMPLETED", res.getPregnancyStatus());
        assertEquals(PregnancyStatus.COMPLETED, pregnancy.getPregnancyStatus());
        assertTrue(pregnancy.isActive());
        verify(pregnancyRepository).save(pregnancy);
    }
}
