package com.ashacompanion.dto.sync;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SyncBatchRequestDTO {

    @NotNull(message = "Operations list is required")
    @NotEmpty(message = "Operations list cannot be empty")
    @Valid
    private List<SyncOperationRequestDTO> operations;

    public SyncBatchRequestDTO() {
    }

    public SyncBatchRequestDTO(List<SyncOperationRequestDTO> operations) {
        this.operations = operations;
    }

    public List<SyncOperationRequestDTO> getOperations() {
        return operations;
    }

    public void setOperations(List<SyncOperationRequestDTO> operations) {
        this.operations = operations;
    }
}
