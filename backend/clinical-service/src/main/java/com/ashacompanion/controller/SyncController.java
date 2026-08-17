package com.ashacompanion.controller;

import com.ashacompanion.dto.sync.*;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import com.ashacompanion.service.SyncService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sync")
public class SyncController {

    private final SyncService syncService;
    private final UserRepository userRepository;

    public SyncController(SyncService syncService, UserRepository userRepository) {
        this.syncService = syncService;
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

    @PostMapping
    public ResponseEntity<SyncOperationResponseDTO> processSingleSync(
            @Valid @RequestBody SyncOperationRequestDTO request) {
        SyncOperationResponseDTO response = syncService.processSingleOperation(request);
        HttpStatus status = "FAILED".equals(response.getStatus()) ? HttpStatus.FORBIDDEN : HttpStatus.OK;
        return new ResponseEntity<>(response, status);
    }

    @PostMapping("/batch")
    public ResponseEntity<SyncBatchResponseDTO> processBatchSync(
            @Valid @RequestBody SyncBatchRequestDTO batchRequest) {
        SyncBatchResponseDTO response = syncService.processBatchOperations(batchRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SyncOperationResponseDTO>> getSyncHistory() {
        User currentUser = getCurrentUser();
        List<SyncOperationResponseDTO> history = syncService.getHistory(currentUser);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{operationId}")
    public ResponseEntity<SyncOperationResponseDTO> getSyncOperation(@PathVariable String operationId) {
        User currentUser = getCurrentUser();
        SyncOperationResponseDTO response = syncService.getOperationById(operationId, currentUser);
        return ResponseEntity.ok(response);
    }
}
