package com.ashacompanion.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vaccines")
public class Vaccine {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vaccine_seq")
    @SequenceGenerator(
        name = "vaccine_seq",
        sequenceName = "VACCINE_SEQ",
        allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "dose_number", nullable = false)
    private Integer doseNumber;

    @Column(name = "recommended_age")
    private String recommendedAge;

    @Column(nullable = false)
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
