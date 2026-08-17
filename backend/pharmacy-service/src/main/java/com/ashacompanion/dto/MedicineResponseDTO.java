package com.ashacompanion.dto;

import com.ashacompanion.entity.Medicine;

public class MedicineResponseDTO {
    private Long id;
    private String name;
    private String code;
    private String genericName;
    private String category;
    private String dosageForm;
    private String strength;
    private String unit;
    private Integer reorderLevel;
    private boolean active;

    public MedicineResponseDTO() {
    }

    public MedicineResponseDTO(Medicine medicine) {
        if (medicine != null) {
            this.id = medicine.getId();
            this.name = medicine.getName();
            this.code = medicine.getCode();
            this.genericName = medicine.getGenericName();
            this.category = medicine.getCategory();
            this.dosageForm = medicine.getDosageForm();
            this.strength = medicine.getStrength();
            this.unit = medicine.getUnit();
            this.reorderLevel = medicine.getReorderLevel();
            this.active = medicine.isActive();
        }
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
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
