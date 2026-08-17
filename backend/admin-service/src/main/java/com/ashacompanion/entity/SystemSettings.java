package com.ashacompanion.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    private Long id = 1L; // Fixed single row configuration

    @Column(name = "offline_ttl", nullable = false)
    private Integer offlineTtl;

    @Column(name = "max_db_size", nullable = false)
    private Integer maxDbSize;

    @Column(name = "compression_ratio", nullable = false)
    private String compressionRatio;

    @Column(name = "biometric_lock", nullable = false)
    private Integer biometricLock; // Represented as 1 (true) or 0 (false)

    @Column(name = "district_incharge", nullable = false)
    private String districtIncharge;

    @Column(name = "backup_schedule", nullable = false)
    private String backupSchedule;

    @Column(name = "server_url", nullable = false)
    private String serverUrl;

    public SystemSettings() {
    }

    public SystemSettings(Integer offlineTtl, Integer maxDbSize, String compressionRatio, Boolean biometricLock,
                          String districtIncharge, String backupSchedule, String serverUrl) {
        this.offlineTtl = offlineTtl;
        this.maxDbSize = maxDbSize;
        this.compressionRatio = compressionRatio;
        setBiometricLock(biometricLock);
        this.districtIncharge = districtIncharge;
        this.backupSchedule = backupSchedule;
        this.serverUrl = serverUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getOfflineTtl() {
        return offlineTtl;
    }

    public void setOfflineTtl(Integer offlineTtl) {
        this.offlineTtl = offlineTtl;
    }

    public Integer getMaxDbSize() {
        return maxDbSize;
    }

    public void setMaxDbSize(Integer maxDbSize) {
        this.maxDbSize = maxDbSize;
    }

    public String getCompressionRatio() {
        return compressionRatio;
    }

    public void setCompressionRatio(String compressionRatio) {
        this.compressionRatio = compressionRatio;
    }

    public Boolean getBiometricLock() {
        return biometricLock != null && biometricLock == 1;
    }

    public void setBiometricLock(Boolean biometricLock) {
        this.biometricLock = (biometricLock != null && biometricLock) ? 1 : 0;
    }

    public String getDistrictIncharge() {
        return districtIncharge;
    }

    public void setDistrictIncharge(String districtIncharge) {
        this.districtIncharge = districtIncharge;
    }

    public String getBackupSchedule() {
        return backupSchedule;
    }

    public void setBackupSchedule(String backupSchedule) {
        this.backupSchedule = backupSchedule;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }
}
