package com.ashacompanion.controller;

import com.ashacompanion.dto.MedicineDemandForecastRequestDTO;
import com.ashacompanion.dto.MedicineDemandForecastResponseDTO;
import com.ashacompanion.entity.User;
import com.ashacompanion.repository.UserRepository;
import com.ashacompanion.service.MedicineForecastService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicine-forecasts")
public class MedicineForecastController {

    private final MedicineForecastService forecastService;
    private final UserRepository userRepository;

    public MedicineForecastController(MedicineForecastService forecastService, UserRepository userRepository) {
        this.forecastService = forecastService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Access denied: Not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied: User not found"));
    }

    @PostMapping("/generate")
    public ResponseEntity<MedicineDemandForecastResponseDTO> generateForecast(
            @Valid @RequestBody MedicineDemandForecastRequestDTO request) {
        User currentUser = getCurrentUser();
        MedicineDemandForecastResponseDTO response = forecastService.generateForecast(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MedicineDemandForecastResponseDTO>> getAllForecasts() {
        User currentUser = getCurrentUser();
        List<MedicineDemandForecastResponseDTO> response = forecastService.getForecasts(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{medicineId}")
    public ResponseEntity<List<MedicineDemandForecastResponseDTO>> getForecastByMedicineId(@PathVariable Long medicineId) {
        User currentUser = getCurrentUser();
        List<MedicineDemandForecastResponseDTO> response = forecastService.getForecastByMedicineId(medicineId, currentUser);
        return ResponseEntity.ok(response);
    }
}
