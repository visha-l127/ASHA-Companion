package com.ashacompanion.service;

import com.ashacompanion.dto.MedicineRequestDTO;
import com.ashacompanion.dto.MedicineResponseDTO;
import com.ashacompanion.entity.Medicine;
import com.ashacompanion.exception.DuplicateMedicineException;
import com.ashacompanion.exception.ResourceNotFoundException;
import com.ashacompanion.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Transactional
    public MedicineResponseDTO createMedicine(MedicineRequestDTO request) {
        if (medicineRepository.existsByCode(request.getCode())) {
            throw new DuplicateMedicineException("Medicine code already exists: " + request.getCode());
        }

        Medicine medicine = new Medicine();
        medicine.setName(request.getName());
        medicine.setCode(request.getCode());
        medicine.setGenericName(request.getGenericName());
        medicine.setCategory(request.getCategory());
        medicine.setDosageForm(request.getDosageForm());
        medicine.setStrength(request.getStrength());
        medicine.setUnit(request.getUnit());
        medicine.setReorderLevel(request.getReorderLevel());
        medicine.setActiveFlag(1);

        Medicine saved = medicineRepository.save(medicine);
        return new MedicineResponseDTO(saved);
    }

    @Transactional
    public MedicineResponseDTO updateMedicine(Long id, MedicineRequestDTO request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));

        if (!medicine.getCode().equalsIgnoreCase(request.getCode()) && medicineRepository.existsByCode(request.getCode())) {
            throw new DuplicateMedicineException("Medicine code already exists: " + request.getCode());
        }

        medicine.setName(request.getName());
        medicine.setCode(request.getCode());
        medicine.setGenericName(request.getGenericName());
        medicine.setCategory(request.getCategory());
        medicine.setDosageForm(request.getDosageForm());
        medicine.setStrength(request.getStrength());
        medicine.setUnit(request.getUnit());
        medicine.setReorderLevel(request.getReorderLevel());

        Medicine saved = medicineRepository.save(medicine);
        return new MedicineResponseDTO(saved);
    }

    @Transactional
    public void deactivateMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        medicine.setActiveFlag(0);
        medicineRepository.save(medicine);
    }

    public MedicineResponseDTO getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        return new MedicineResponseDTO(medicine);
    }

    public List<MedicineResponseDTO> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(MedicineResponseDTO::new)
                .collect(Collectors.toList());
    }
}
