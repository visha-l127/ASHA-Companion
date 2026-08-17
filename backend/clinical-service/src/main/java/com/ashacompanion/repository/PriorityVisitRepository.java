package com.ashacompanion.repository;

import com.ashacompanion.entity.PriorityVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PriorityVisitRepository extends JpaRepository<PriorityVisit, Long> {
    List<PriorityVisit> findByAshaId(String ashaId);
}
