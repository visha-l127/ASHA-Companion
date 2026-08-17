package com.ashacompanion.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "role_permissions")
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_permission_seq")
    @SequenceGenerator(
        name = "role_permission_seq",
        sequenceName = "ROLE_PERMISSION_SEQ",
        allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, unique = true)
    private String role;

    @Column(nullable = false)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_capability_permissions", joinColumns = @JoinColumn(name = "role_permission_id"))
    @Column(name = "permission")
    private List<String> permissions = new ArrayList<>();

    public RolePermission() {
    }

    public RolePermission(String role, String description, List<String> permissions) {
        this.role = role;
        this.description = description;
        this.permissions = permissions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }
}
