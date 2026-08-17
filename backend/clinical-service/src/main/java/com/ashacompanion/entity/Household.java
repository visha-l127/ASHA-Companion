package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "households", indexes = {
    @Index(name = "idx_hh_asha", columnList = "asha_worker_id"),
    @Index(name = "idx_hh_phc", columnList = "phc_id")
})
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "household_seq")
    @SequenceGenerator(
        name = "household_seq",
        sequenceName = "HOUSEHOLD_SEQ",
        allocationSize = 1
    )
    private Long id;

    @Column(name = "household_number", nullable = false)
    private String householdNumber;

    @Column(name = "head_name", nullable = false)
    private String headName;

    @Column(nullable = false)
    private String village;

    @Column(name = "members_count", nullable = false)
    private Integer membersCount;

    @Column(nullable = false)
    private String category; // APL, BPL, AAY

    @Column(name = "water_source", nullable = false)
    private String waterSource; // piped, handpump, well

    @Column(nullable = false)
    private Integer toilet = 1; // 1 = toilet present, 0 = no toilet

    @Column(name = "asha_worker_id")
    private Long ashaWorkerId;

    @Column(name = "phc_id")
    private String phcId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Integer active = 1;

    public Household() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHouseholdNumber() {
        return householdNumber;
    }

    public void setHouseholdNumber(String householdNumber) {
        this.householdNumber = householdNumber;
    }

    public String getHeadName() {
        return headName;
    }

    public void setHeadName(String headName) {
        this.headName = headName;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public Integer getMembersCount() {
        return membersCount;
    }

    public void setMembersCount(Integer membersCount) {
        this.membersCount = membersCount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getWaterSource() {
        return waterSource;
    }

    public void setWaterSource(String waterSource) {
        this.waterSource = waterSource;
    }

    public Integer getToilet() {
        return toilet;
    }

    public void setToilet(Integer toilet) {
        this.toilet = toilet;
    }

    public Long getAshaWorkerId() {
        return ashaWorkerId;
    }

    public void setAshaWorkerId(Long ashaWorkerId) {
        this.ashaWorkerId = ashaWorkerId;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getActive() {
        return active;
    }

    public void setActive(Integer active) {
        this.active = active;
    }

    public boolean isActive() {
        return active != null && active == 1;
    }

    public void setActive(boolean active) {
        this.active = active ? 1 : 0;
    }
}
