package com.ashacompanion.repository;

import com.ashacompanion.entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HouseholdRepository extends JpaRepository<Household, Long> {

    List<Household> findByAshaWorkerIdAndActive(Long ashaWorkerId, Integer active);

    List<Household> findByPhcIdAndActive(String phcId, Integer active);

    List<Household> findByActive(Integer active);
}
