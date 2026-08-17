package com.ashacompanion.dto;

import com.ashacompanion.entity.Vaccine;

public class VaccineResponseDTO {
    private Long id;
    private String code;
    private String name;
    private Integer doseNumber;
    private String recommendedAge;
    private boolean active;

    public VaccineResponseDTO() {
    }

    public VaccineResponseDTO(Vaccine vaccine) {
        if (vaccine != null) {
            this.id = vaccine.getId();
            this.code = vaccine.getCode();
            this.name = vaccine.getName();
            this.doseNumber = vaccine.getDoseNumber();
            this.recommendedAge = vaccine.getRecommendedAge();
            this.active = vaccine.isActive();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
