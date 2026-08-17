package com.ashacompanion.dto;

import com.ashacompanion.entity.User;

public class UserResponseDTO {
    private Long id;
    private String name;
    private String username;
    private String role;
    private String phcId;
    private String status;
    private String phone;
    private String location;

    public UserResponseDTO() {
    }

    public UserResponseDTO(Long id, String name, String username, String role, String phcId) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.role = role;
        this.phcId = phcId;
        this.status = "active";
    }

    public UserResponseDTO(Long id, String name, String username, String role, String phcId, String status, String phone, String location) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.role = role;
        this.phcId = phcId;
        this.status = status != null ? status : "active";
        this.phone = phone;
        this.location = location;
    }

    public UserResponseDTO(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.username = user.getUsername();
            this.role = user.getRole();
            this.phcId = user.getPhcId();
            this.status = user.getStatus() != null ? user.getStatus() : "active";
            this.phone = user.getPhone();
            this.location = user.getLocation();
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhcId() {
        return phcId;
    }

    public void setPhcId(String phcId) {
        this.phcId = phcId;
    }

    public String getStatus() {
        return status != null ? status : "active";
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
