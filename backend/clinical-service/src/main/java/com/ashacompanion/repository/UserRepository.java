package com.ashacompanion.repository;

import com.ashacompanion.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameIgnoreCase(String username);

    java.util.List<User> findByRole(String role);

    java.util.List<User> findByRoleAndPhcId(String role, String phcId);

    java.util.List<User> findByPhcId(String phcId);
}