package com.ashacompanion.service;

import com.ashacompanion.dto.LoginRequest;
import com.ashacompanion.dto.LoginResponse;
import com.ashacompanion.dto.UserResponseDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.exception.DuplicateUsernameException;
import com.ashacompanion.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.PHCRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PHCRepository phcRepository;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtService jwtService, PHCRepository phcRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.phcRepository = phcRepository;
    }

    public User register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new DuplicateUsernameException("Username already exists: " + user.getUsername());
        }

        // Force role to ASHA to prevent privilege escalation
        user.setRole("ASHA");

        // Validate PHC code if supplied
        if (user.getPhcId() != null && !user.getPhcId().trim().isEmpty()) {
            if (!phcRepository.existsByCode(user.getPhcId())) {
                throw new ResourceNotFoundException("PHC not found with code: " + user.getPhcId());
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest loginRequest) {
        String identifier = loginRequest.getUsername() != null ? loginRequest.getUsername().trim() : "";
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByUsernameIgnoreCase(identifier))
                .or(() -> {
                    if (identifier.contains("@")) {
                        String prefix = identifier.substring(0, identifier.indexOf('@')).trim();
                        return userRepository.findByUsernameIgnoreCase(prefix);
                    }
                    return Optional.empty();
                })
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(user);
        UserResponseDTO userDto = new UserResponseDTO(user);
        return new LoginResponse(token, userDto);
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (oldPassword != null && !oldPassword.trim().isEmpty()) {
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new BadCredentialsException("Incorrect current password");
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}