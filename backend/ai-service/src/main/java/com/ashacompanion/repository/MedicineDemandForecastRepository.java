package com.ashacompanion.repository;

import com.ashacompanion.entity.MedicineDemandForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineDemandForecastRepository extends JpaRepository<MedicineDemandForecast, Long> {

    List<MedicineDemandForecast> findByMedicineIdOrderByGeneratedAtDesc(Long medicineId);

    List<MedicineDemandForecast> findByPhcIdOrderByGeneratedAtDesc(String phcId);

    List<MedicineDemandForecast> findByForecastDate(LocalDate forecastDate);

    Optional<MedicineDemandForecast> findTopByMedicineIdAndPhcIdOrderByGeneratedAtDesc(Long medicineId, String phcId);
}
