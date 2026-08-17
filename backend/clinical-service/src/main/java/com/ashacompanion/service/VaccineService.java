package com.ashacompanion.service;

import com.ashacompanion.dto.VaccineRequestDTO;
import com.ashacompanion.dto.VaccineResponseDTO;
import com.ashacompanion.entity.Vaccine;
import com.ashacompanion.exception.DuplicateVaccineCodeException;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.VaccineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccineService {

    private final VaccineRepository vaccineRepository;

    public VaccineService(VaccineRepository vaccineRepository) {
        this.vaccineRepository = vaccineRepository;
    }

    @Transactional
    public VaccineResponseDTO createVaccine(VaccineRequestDTO request) {
        if (vaccineRepository.existsByCode(request.getCode())) {
            throw new DuplicateVaccineCodeException("Vaccine code already exists: " + request.getCode());
        }

        Vaccine vaccine = new Vaccine();
        vaccine.setCode(request.getCode());
        vaccine.setName(request.getName());
        vaccine.setDoseNumber(request.getDoseNumber());
        vaccine.setRecommendedAge(request.getRecommendedAge());
        if (request.getActive() != null) {
            vaccine.setActive(request.getActive());
        } else {
            vaccine.setActive(true);
        }

        Vaccine savedVaccine = vaccineRepository.save(vaccine);
        return new VaccineResponseDTO(savedVaccine);
    }

    public List<VaccineResponseDTO> getAllVaccines() {
        return vaccineRepository.findAll().stream()
                .map(VaccineResponseDTO::new)
                .collect(Collectors.toList());
    }

    public VaccineResponseDTO getVaccineById(Long id) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found with ID: " + id));
        return new VaccineResponseDTO(vaccine);
    }

    @Transactional
    public VaccineResponseDTO updateVaccine(Long id, VaccineRequestDTO request) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found with ID: " + id));

        if (!vaccine.getCode().equalsIgnoreCase(request.getCode()) && vaccineRepository.existsByCode(request.getCode())) {
            throw new DuplicateVaccineCodeException("Vaccine code already exists: " + request.getCode());
        }

        vaccine.setCode(request.getCode());
        vaccine.setName(request.getName());
        vaccine.setDoseNumber(request.getDoseNumber());
        vaccine.setRecommendedAge(request.getRecommendedAge());
        if (request.getActive() != null) {
            vaccine.setActive(request.getActive());
        }

        Vaccine savedVaccine = vaccineRepository.save(vaccine);
        return new VaccineResponseDTO(savedVaccine);
    }

    @Transactional
    public void deactivateVaccine(Long id) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found with ID: " + id));
        vaccine.setActive(false);
        vaccineRepository.save(vaccine);
    }
}
