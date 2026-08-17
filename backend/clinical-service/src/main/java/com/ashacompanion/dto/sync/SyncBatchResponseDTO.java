package com.ashacompanion.dto.sync;

import java.util.ArrayList;
import java.util.List;

public class SyncBatchResponseDTO {

    private Integer total;
    private Integer processed;
    private Integer conflicts;
    private Integer failed;
    private Integer duplicates;
    private List<SyncOperationResponseDTO> results;

    public SyncBatchResponseDTO() {
        this.total = 0;
        this.processed = 0;
        this.conflicts = 0;
        this.failed = 0;
        this.duplicates = 0;
        this.results = new ArrayList<>();
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public Integer getProcessed() {
        return processed;
    }

    public void setProcessed(Integer processed) {
        this.processed = processed;
    }

    public Integer getConflicts() {
        return conflicts;
    }

    public void setConflicts(Integer conflicts) {
        this.conflicts = conflicts;
    }

    public Integer getFailed() {
        return failed;
    }

    public void setFailed(Integer failed) {
        this.failed = failed;
    }

    public Integer getDuplicates() {
        return duplicates;
    }

    public void setDuplicates(Integer duplicates) {
        this.duplicates = duplicates;
    }

    public List<SyncOperationResponseDTO> getResults() {
        return results;
    }

    public void setResults(List<SyncOperationResponseDTO> results) {
        this.results = results;
    }
}
