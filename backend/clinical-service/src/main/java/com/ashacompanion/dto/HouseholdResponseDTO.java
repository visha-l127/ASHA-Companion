package com.ashacompanion.dto;

import com.ashacompanion.entity.Household;
import java.time.LocalDateTime;

public class HouseholdResponseDTO {
    private Long id;
    private String householdNumber;
    private String headName;
    private String village;
    private Integer membersCount;
    private String category;
    private String waterSource;
    private Boolean toilet;
    private Long ashaWorkerId;
    private String phcId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HouseholdResponseDTO() {
    }

    public HouseholdResponseDTO(Household hh) {
        this.id = hh.getId();
        this.householdNumber = hh.getHouseholdNumber();
        this.headName = hh.getHeadName();
        this.village = hh.getVillage();
        this.membersCount = hh.getMembersCount();
        this.category = hh.getCategory();
        this.waterSource = hh.getWaterSource();
        this.toilet = hh.getToilet() != null && hh.getToilet() == 1;
        this.ashaWorkerId = hh.getAshaWorkerId();
        this.phcId = hh.getPhcId();
        this.createdAt = hh.getCreatedAt();
        this.updatedAt = hh.getUpdatedAt();
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

    public Boolean getToilet() {
        return toilet;
    }

    public void setToilet(Boolean toilet) {
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
}
