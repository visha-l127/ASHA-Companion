package com.ashacompanion.service;

import java.util.stream.Collectors;

import com.ashacompanion.dto.sync.*;
import com.ashacompanion.dto.*;
import com.ashacompanion.entity.*;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SyncService {

    private final SyncOperationRepository syncOperationRepository;
    private final UserRepository userRepository;
    private final PatientService patientService;
    private final PregnancyService pregnancyService;
    private final AntenatalVisitService antenatalVisitService;
    private final ImmunizationService immunizationService;
    private final NutritionService nutritionService;
    private final PatientRepository patientRepository;
    private final PregnancyRepository pregnancyRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public SyncService(SyncOperationRepository syncOperationRepository,
                       UserRepository userRepository,
                       PatientService patientService,
                       PregnancyService pregnancyService,
                       AntenatalVisitService antenatalVisitService,
                       ImmunizationService immunizationService,
                       NutritionService nutritionService,
                       PatientRepository patientRepository,
                       PregnancyRepository pregnancyRepository,
                       ObjectMapper objectMapper,
                       RestTemplate restTemplate) {
        this.syncOperationRepository = syncOperationRepository;
        this.userRepository = userRepository;
        this.patientService = patientService;
        this.pregnancyService = pregnancyService;
        this.antenatalVisitService = antenatalVisitService;
        this.immunizationService = immunizationService;
        this.nutritionService = nutritionService;
        this.patientRepository = patientRepository;
        this.pregnancyRepository = pregnancyRepository;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    private void recordAudit(String action, String entityType, String entityId, User user, String details, String method, String path, String status) {
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("action", action);
            req.put("entityType", entityType);
            req.put("entityId", entityId);
            req.put("performedBy", user.getId());
            req.put("performedByName", user.getUsername());
            req.put("details", details);
            req.put("httpStatus", status);
            req.put("httpMethod", method);
            req.put("requestPath", path);
            restTemplate.postForObject("http://ADMIN-SERVICE/internal/audit-logs", req, Void.class);
        } catch (Exception e) {
            // Ignore audit logging failures
        }
    }

    public SyncOperationResponseDTO processSingleOperation(SyncOperationRequestDTO request) {
        User currentUser = getCurrentUser();

        // 1. Idempotency Check
        Optional<SyncOperation> existingOpOpt = syncOperationRepository.findByOperationId(request.getOperationId());
        if (existingOpOpt.isPresent()) {
            SyncOperation existing = existingOpOpt.get();
            return new SyncOperationResponseDTO(
                    existing.getOperationId(),
                    existing.getEntityType(),
                    existing.getEntityId(),
                    existing.getOperationType(),
                    "DUPLICATE",
                    existing.getConflictType(),
                    "Duplicate operationId: previously processed"
            );
        }

        String entityType = request.getEntityType().toUpperCase();
        String operationType = request.getOperationType().toUpperCase();
        String status = "PROCESSED";
        String conflictType = null;
        String message = "Operation synchronized successfully";
        String createdEntityId = request.getEntityId();

        try {
            switch (entityType) {
                case "PATIENT":
                    if ("CREATE".equals(operationType)) {
                        if (!"ASHA".equals(currentUser.getRole())) {
                            status = "FAILED";
                            message = "Access denied: Only ASHA workers can create patients";
                            break;
                        }
                        PatientRequestDTO pReq = objectMapper.convertValue(request.getPayload(), PatientRequestDTO.class);
                        PatientResponseDTO pRes = patientService.createPatient(pReq);
                        createdEntityId = String.valueOf(pRes.getId());
                    } else if ("UPDATE".equals(operationType)) {
                        Long pId = Long.parseLong(request.getEntityId());
                        Patient existingPatient = patientRepository.findById(pId)
                                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + pId));

                        if ("ASHA".equals(currentUser.getRole()) && !currentUser.getId().equals(existingPatient.getAshaWorkerId())) {
                            status = "FAILED";
                            message = "Access denied: Patient is assigned to another ASHA worker";
                            break;
                        }

                        // Conflict check
                        if (request.getClientUpdatedAt() != null && existingPatient.getUpdatedAt() != null) {
                            if (existingPatient.getUpdatedAt().isAfter(request.getClientUpdatedAt())) {
                                status = "CONFLICT";
                                conflictType = "SERVER_VERSION_NEWER";
                                message = "Server has a newer version of this patient record";
                                break;
                            }
                        }

                        PatientRequestDTO pReq = objectMapper.convertValue(request.getPayload(), PatientRequestDTO.class);
                        patientService.updatePatient(pId, pReq);
                    } else {
                        throw new IllegalArgumentException("Unsupported operationType for PATIENT: " + operationType);
                    }
                    break;

                case "PREGNANCY":
                    if ("CREATE".equals(operationType)) {
                        PregnancyRequestDTO prReq = objectMapper.convertValue(request.getPayload(), PregnancyRequestDTO.class);
                        Patient patient = patientRepository.findById(prReq.getPatientId())
                                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + prReq.getPatientId()));
                        if ("ASHA".equals(currentUser.getRole()) && !currentUser.getId().equals(patient.getAshaWorkerId())) {
                            status = "FAILED";
                            message = "Access denied: Patient belongs to another ASHA worker";
                            break;
                        }
                        PregnancyResponseDTO prRes = pregnancyService.createPregnancy(prReq);
                        createdEntityId = String.valueOf(prRes.getId());
                    } else if ("UPDATE".equals(operationType)) {
                        Long prId = Long.parseLong(request.getEntityId());
                        Pregnancy existingPreg = pregnancyRepository.findById(prId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + prId));

                        if ("ASHA".equals(currentUser.getRole()) && !currentUser.getId().equals(existingPreg.getPatient().getAshaWorkerId())) {
                            status = "FAILED";
                            message = "Access denied: Patient is assigned to another ASHA worker";
                            break;
                        }

                        if (request.getClientUpdatedAt() != null && existingPreg.getUpdatedAt() != null) {
                            if (existingPreg.getUpdatedAt().isAfter(request.getClientUpdatedAt())) {
                                status = "CONFLICT";
                                conflictType = "SERVER_VERSION_NEWER";
                                message = "Server has a newer version of this pregnancy record";
                                break;
                            }
                        }

                        PregnancyRequestDTO prReq = objectMapper.convertValue(request.getPayload(), PregnancyRequestDTO.class);
                        pregnancyService.updatePregnancy(prId, prReq);
                    } else {
                        throw new IllegalArgumentException("Unsupported operationType for PREGNANCY: " + operationType);
                    }
                    break;

                case "ANTENATAL_VISIT":
                    if ("CREATE".equals(operationType)) {
                        Long pregId = Long.parseLong(request.getEntityId());
                        Pregnancy preg = pregnancyRepository.findById(pregId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pregnancy not found with ID: " + pregId));
                        if ("ASHA".equals(currentUser.getRole()) && !currentUser.getId().equals(preg.getPatient().getAshaWorkerId())) {
                            status = "FAILED";
                            message = "Access denied: Pregnancy is assigned to another ASHA worker";
                            break;
                        }
                        AntenatalVisitRequestDTO vReq = objectMapper.convertValue(request.getPayload(), AntenatalVisitRequestDTO.class);
                        AntenatalVisitResponseDTO vRes = antenatalVisitService.createVisit(pregId, vReq);
                        createdEntityId = String.valueOf(vRes.getId());
                    } else {
                        throw new IllegalArgumentException("Unsupported operationType for ANTENATAL_VISIT: " + operationType);
                    }
                    break;

                case "IMMUNIZATION":
                    if ("CREATE".equals(operationType)) {
                        ImmunizationRequestDTO iReq = objectMapper.convertValue(request.getPayload(), ImmunizationRequestDTO.class);
                        Patient patient = patientRepository.findById(iReq.getPatientId())
                                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + iReq.getPatientId()));
                        if ("ASHA".equals(currentUser.getRole()) && !currentUser.getId().equals(patient.getAshaWorkerId())) {
                            status = "FAILED";
                            message = "Access denied: Patient is assigned to another ASHA worker";
                            break;
                        }
                        ImmunizationResponseDTO iRes = immunizationService.createImmunization(iReq);
                        createdEntityId = String.valueOf(iRes.getId());
                    } else {
                        throw new IllegalArgumentException("Unsupported operationType for IMMUNIZATION: " + operationType);
                    }
                    break;

                case "NUTRITION_RECORD":
                    if ("CREATE".equals(operationType)) {
                        NutritionRecordRequestDTO nReq = objectMapper.convertValue(request.getPayload(), NutritionRecordRequestDTO.class);
                        Patient patient = patientRepository.findById(nReq.getPatientId())
                                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + nReq.getPatientId()));
                        if ("ASHA".equals(currentUser.getRole()) && !currentUser.getId().equals(patient.getAshaWorkerId())) {
                            status = "FAILED";
                            message = "Access denied: Patient is assigned to another ASHA worker";
                            break;
                        }
                        NutritionRecordResponseDTO nRes = nutritionService.createNutritionRecord(nReq);
                        createdEntityId = String.valueOf(nRes.getId());
                    } else {
                        throw new IllegalArgumentException("Unsupported operationType for NUTRITION_RECORD: " + operationType);
                    }
                    break;

                case "MEDICINE_TRANSACTION":
                    if ("CREATE".equals(operationType)) {
                        if (!"ADMIN".equals(currentUser.getRole()) && !"PHARMACIST".equals(currentUser.getRole())) {
                            status = "FAILED";
                            message = "Access denied: Insufficient privileges for medicine transaction";
                            break;
                        }
                        
                        Map<?, ?> mRes = restTemplate.postForObject(
                                "http://PHARMACY-SERVICE/internal/sync/receive-stock",
                                request.getPayload(),
                                Map.class
                        );
                        createdEntityId = mRes != null ? String.valueOf(mRes.get("id")) : null;
                    } else {
                        throw new IllegalArgumentException("Unsupported operationType for MEDICINE_TRANSACTION: " + operationType);
                    }
                    break;

                default:
                    throw new IllegalArgumentException("Unsupported entityType: " + entityType);
            }

        } catch (AccessDeniedException e) {
            status = "FAILED";
            message = "Access denied: " + e.getMessage();
        } catch (Exception e) {
            status = "FAILED";
            message = e.getMessage() != null ? e.getMessage() : "Sync operation execution failed";
        }

        // Save Audit SyncOperation Entity
        SyncOperation syncOp = new SyncOperation();
        syncOp.setOperationId(request.getOperationId());
        syncOp.setEntityType(entityType);
        syncOp.setEntityId(createdEntityId);
        syncOp.setOperationType(operationType);
        try {
            syncOp.setPayload(objectMapper.writeValueAsString(request.getPayload()));
        } catch (Exception e) {
            syncOp.setPayload(request.getPayload().toString());
        }
        syncOp.setStatus(status);
        syncOp.setConflictType(conflictType);
        syncOp.setErrorMessage("PROCESSED".equals(status) ? null : message);
        syncOp.setUserId(currentUser.getId());
        syncOp.setPhcId(currentUser.getPhcId());
        syncOp.setClientTimestamp(request.getClientTimestamp());
        syncOp.setServerTimestamp(LocalDateTime.now());
        syncOp.setProcessedAt(LocalDateTime.now());

        syncOperationRepository.save(syncOp);

        String auditAction = "CONFLICT".equals(status) ? "SYNC_CONFLICT" : "OFFLINE_SYNC";
        recordAudit(auditAction, entityType, createdEntityId, currentUser,
                "Offline sync operation " + request.getOperationId() + " (" + operationType + " " + entityType + ") status: " + status,
                "POST", "/sync", status);

        return new SyncOperationResponseDTO(request.getOperationId(), entityType, createdEntityId, operationType, status, conflictType, message);
    }

    @Transactional
    public SyncBatchResponseDTO processBatchOperations(SyncBatchRequestDTO batchRequest) {
        if (batchRequest.getOperations() == null || batchRequest.getOperations().isEmpty()) {
            throw new IllegalArgumentException("Sync batch request contains no operations");
        }
        if (batchRequest.getOperations().size() > 100) {
            throw new IllegalArgumentException("Batch size exceeds maximum limit of 100 operations");
        }

        SyncBatchResponseDTO batchResponse = new SyncBatchResponseDTO();
        batchResponse.setTotal(batchRequest.getOperations().size());

        int processed = 0;
        int conflicts = 0;
        int failed = 0;
        int duplicates = 0;

        List<SyncOperationResponseDTO> results = new ArrayList<>();
        for (SyncOperationRequestDTO opReq : batchRequest.getOperations()) {
            SyncOperationResponseDTO opRes = processSingleOperation(opReq);
            results.add(opRes);

            if ("PROCESSED".equals(opRes.getStatus())) {
                processed++;
            } else if ("CONFLICT".equals(opRes.getStatus())) {
                conflicts++;
            } else if ("DUPLICATE".equals(opRes.getStatus())) {
                duplicates++;
            } else {
                failed++;
            }
        }

        batchResponse.setProcessed(processed);
        batchResponse.setConflicts(conflicts);
        batchResponse.setFailed(failed);
        batchResponse.setDuplicates(duplicates);
        batchResponse.setResults(results);

        return batchResponse;
    }

    public List<SyncOperationResponseDTO> getHistory(User currentUser) {
        String role = currentUser.getRole();
        List<SyncOperation> ops;

        if ("ADMIN".equals(role)) {
            ops = syncOperationRepository.findAll();
        } else if ("PHC_SUPERVISOR".equals(role)) {
            String phcId = currentUser.getPhcId();
            ops = (phcId != null) ? syncOperationRepository.findByPhcIdOrderByClientTimestampDesc(phcId) : Collections.emptyList();
        } else {
            ops = syncOperationRepository.findByUserIdOrderByClientTimestampDesc(currentUser.getId());
        }

        return ops.stream().map(SyncOperationResponseDTO::new).collect(Collectors.toList());
    }

    public SyncOperationResponseDTO getOperationById(String operationId, User currentUser) {
        SyncOperation op = syncOperationRepository.findByOperationId(operationId)
                .orElseThrow(() -> new ResourceNotFoundException("Sync operation not found with operationId: " + operationId));

        String role = currentUser.getRole();
        if ("ADMIN".equals(role)) {
            // Global access
        } else if ("PHC_SUPERVISOR".equals(role)) {
            if (currentUser.getPhcId() == null || !currentUser.getPhcId().equals(op.getPhcId())) {
                throw new AccessDeniedException("Access denied: Sync operation belongs to another PHC");
            }
        } else {
            if (currentUser.getId() == null || !currentUser.getId().equals(op.getUserId())) {
                throw new AccessDeniedException("Access denied: Sync operation belongs to another user");
            }
        }

        return new SyncOperationResponseDTO(op);
    }
}
