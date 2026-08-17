package com.ashacompanion.repository;

import com.ashacompanion.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByCode(String code);

    boolean existsByCode(String code);

    List<Medicine> findByActiveFlag(Integer activeFlag);
}
