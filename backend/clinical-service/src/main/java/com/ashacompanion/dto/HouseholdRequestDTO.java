package com.ashacompanion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HouseholdRequestDTO {

    @NotBlank(message = "Household number is required")
    private String householdNumber;

    @NotBlank(message = "Head of household name is required")
    private String headName;

    @NotBlank(message = "Village is required")
    private String village;

    @NotNull(message = "Members count is required")
    @Min(value = 1, message = "Members count must be at least 1")
    private Integer membersCount;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Water source is required")
    private String waterSource;

    @NotNull(message = "Toilet status is required")
    private Boolean toilet;

    public HouseholdRequestDTO() {
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
}
