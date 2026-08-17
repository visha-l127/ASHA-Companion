package com.ashacompanion.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "medicines", indexes = {
    @Index(name = "idx_medicine_code", columnList = "code", unique = true)
})
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medicine_seq")
    @SequenceGenerator(
        name = "medicine_seq",
        sequenceName = "MEDICINE_SEQ",
        allocationSize = 1
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "generic_name")
    private String genericName;

    private String category;

    @Column(name = "dosage_form")
    private String dosageForm;

    private String strength;
    private String unit;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 0;

    @Column(name = "active_flag", nullable = false)
    private Integer activeFlag = 1;

    public Medicine() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getGenericName() {
        return genericName;
    }

    public void setGenericName(String genericName) {
        this.genericName = genericName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDosageForm() {
        return dosageForm;
    }

    public void setDosageForm(String dosageForm) {
        this.dosageForm = dosageForm;
    }

    public String getStrength() {
        return strength;
    }

    public void setStrength(String strength) {
        this.strength = strength;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public boolean isActive() {
        return activeFlag != null && activeFlag == 1;
    }

    public void setActive(boolean active) {
        this.activeFlag = active ? 1 : 0;
    }

    public Integer getActiveFlag() {
        return activeFlag;
    }

    public void setActiveFlag(Integer activeFlag) {
        this.activeFlag = activeFlag;
    }
}
