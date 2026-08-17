package com.ashacompanion.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "phcs")
public class PHC {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "phc_seq")
    @SequenceGenerator(
        name = "phc_seq",
        sequenceName = "PHC_SEQ",
        allocationSize = 1
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String district;
    private String block;
    private String address;

    @Column(nullable = false)
    private Integer active = 1;

    public PHC() {
    }

    public PHC(String name, String code, String district, String block, String address) {
        this.name = name;
        this.code = code;
        this.district = district;
        this.block = block;
        this.address = address;
        this.active = 1;
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
        return active != null && active == 1;
    }

    public void setActive(boolean active) {
        this.active = active ? 1 : 0;
    }
}
