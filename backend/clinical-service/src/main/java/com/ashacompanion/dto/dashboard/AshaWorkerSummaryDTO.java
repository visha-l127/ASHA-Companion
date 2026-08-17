package com.ashacompanion.dto.dashboard;

public class AshaWorkerSummaryDTO {
    private Long userId;
    private String name;
    private String username;
    private String phcId;
    private long patientCount;

    public AshaWorkerSummaryDTO() {
    }

    public AshaWorkerSummaryDTO(Long userId, String name, String username, String phcId, long patientCount) {
        this.userId = userId;
        this.name = name;
        this.username = username;
        this.phcId = phcId;
        this.patientCount = patientCount;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public long getPatientCount() {
        return patientCount;
    }

    public void setPatientCount(long patientCount) {
        this.patientCount = patientCount;
    }
}
