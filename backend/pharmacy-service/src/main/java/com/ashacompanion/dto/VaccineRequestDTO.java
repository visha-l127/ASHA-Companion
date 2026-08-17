package com.ashacompanion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class VaccineRequestDTO {

    @NotBlank(message = "Vaccine code is required")
    private String code;

    @NotBlank(message = "Vaccine name is required")
    private String name;

    @NotNull(message = "Dose number count is required")
    @Positive(message = "Dose number must be a positive integer")
    private Integer doseNumber;

    private String recommendedAge;
    private Boolean active = true;

    public VaccineRequestDTO() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getDoseNumber() {
        return doseNumber;
    }

    public void setDoseNumber(Integer doseNumber) {
        this.doseNumber = doseNumber;
    }

    public String getRecommendedAge() {
        return recommendedAge;
    }

    public void setRecommendedAge(String recommendedAge) {
        this.recommendedAge = recommendedAge;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
