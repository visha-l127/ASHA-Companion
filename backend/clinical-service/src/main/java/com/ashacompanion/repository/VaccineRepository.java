package com.ashacompanion.repository;

import com.ashacompanion.entity.Vaccine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaccineRepository extends JpaRepository<Vaccine, Long> {

    Optional<Vaccine> findByCode(String code);

    boolean existsByCode(String code);

    List<Vaccine> findByActive(Integer active);
}
