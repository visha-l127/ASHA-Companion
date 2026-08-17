package com.ashacompanion.dto;

import com.ashacompanion.entity.PHC;

public class PHCResponseDTO {
    private Long id;
    private String name;
    private String code;
    private String district;
    private String block;
    private String address;
    private boolean active;

    public PHCResponseDTO() {
    }

    public PHCResponseDTO(PHC phc) {
        if (phc != null) {
            this.id = phc.getId();
            this.name = phc.getName();
            this.code = phc.getCode();
            this.district = phc.getDistrict();
            this.block = phc.getBlock();
            this.address = phc.getAddress();
            this.active = phc.isActive();
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

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
