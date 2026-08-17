package com.ashacompanion.entity;


public class Vaccine {

    private Long id;

    private String code;

    private String name;

    private Integer doseNumber;

    private String recommendedAge;

    private Integer active = 1;

    public Vaccine() {
    }

    public Vaccine(String code, String name, Integer doseNumber, String recommendedAge) {
        this.code = code;
        this.name = name;
        this.doseNumber = doseNumber;
        this.recommendedAge = recommendedAge;
        this.active = 1;
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
        return active != null && active == 1;
    }

    public void setActive(boolean active) {
        this.active = active ? 1 : 0;
    }
}
