package com.ashacompanion.dto;

public class AdminDashboardStatsDTO {
    private long totalPhcs;
    private long activePhcs;
    private long inactivePhcs;
    private long totalUsers;
    private long totalSupervisors;
    private long totalAshas;
    private long totalPharmacists;
    private long totalAuditLogs;
    private int offlineTtl;
    private int maxDbSize;
    private String compressionRatio;
    private String districtIncharge;
    private String serverUrl;

    public AdminDashboardStatsDTO() {
    }

    public AdminDashboardStatsDTO(long totalPhcs, long activePhcs, long inactivePhcs, long totalUsers,
                                  long totalSupervisors, long totalAshas, long totalPharmacists,
                                  long totalAuditLogs, int offlineTtl, int maxDbSize,
                                  String compressionRatio, String districtIncharge, String serverUrl) {
        this.totalPhcs = totalPhcs;
        this.activePhcs = activePhcs;
        this.inactivePhcs = inactivePhcs;
        this.totalUsers = totalUsers;
        this.totalSupervisors = totalSupervisors;
        this.totalAshas = totalAshas;
        this.totalPharmacists = totalPharmacists;
        this.totalAuditLogs = totalAuditLogs;
        this.offlineTtl = offlineTtl;
        this.maxDbSize = maxDbSize;
        this.compressionRatio = compressionRatio;
        this.districtIncharge = districtIncharge;
        this.serverUrl = serverUrl;
    }

    public long getTotalPhcs() {
        return totalPhcs;
    }

    public void setTotalPhcs(long totalPhcs) {
        this.totalPhcs = totalPhcs;
    }

    public long getActivePhcs() {
        return activePhcs;
    }

    public void setActivePhcs(long activePhcs) {
        this.activePhcs = activePhcs;
    }

    public long getInactivePhcs() {
        return inactivePhcs;
    }

    public void setInactivePhcs(long inactivePhcs) {
        this.inactivePhcs = inactivePhcs;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalSupervisors() {
        return totalSupervisors;
    }

    public void setTotalSupervisors(long totalSupervisors) {
        this.totalSupervisors = totalSupervisors;
    }

    public long getTotalAshas() {
        return totalAshas;
    }

    public void setTotalAshas(long totalAshas) {
        this.totalAshas = totalAshas;
    }

    public long getTotalPharmacists() {
        return totalPharmacists;
    }

    public void setTotalPharmacists(long totalPharmacists) {
        this.totalPharmacists = totalPharmacists;
    }

    public long getTotalAuditLogs() {
        return totalAuditLogs;
    }

    public void setTotalAuditLogs(long totalAuditLogs) {
        this.totalAuditLogs = totalAuditLogs;
    }

    public int getOfflineTtl() {
        return offlineTtl;
    }

    public void setOfflineTtl(int offlineTtl) {
        this.offlineTtl = offlineTtl;
    }

    public int getMaxDbSize() {
        return maxDbSize;
    }

    public void setMaxDbSize(int maxDbSize) {
        this.maxDbSize = maxDbSize;
    }

    public String getCompressionRatio() {
        return compressionRatio;
    }

    public void setCompressionRatio(String compressionRatio) {
        this.compressionRatio = compressionRatio;
    }

    public String getDistrictIncharge() {
        return districtIncharge;
    }

    public void setDistrictIncharge(String districtIncharge) {
        this.districtIncharge = districtIncharge;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }
}
