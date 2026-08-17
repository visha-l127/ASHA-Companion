package com.ashacompanion.dto;

import com.ashacompanion.entity.User;

public class UserResponseDTO {
    private Long id;
    private String name;
    private String username;
    private String role;
    private String phcId;

    public UserResponseDTO() {
    }

    public UserResponseDTO(Long id, String name, String username, String role, String phcId) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.role = role;
        this.phcId = phcId;
    }

    public UserResponseDTO(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.username = user.getUsername();
            this.role = user.getRole();
            this.phcId = user.getPhcId();
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
}
