package com.ashacompanion.repository;

import com.ashacompanion.entity.PHC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PHCRepository extends JpaRepository<PHC, Long> {

    boolean existsByCode(String code);

    Optional<PHC> findByCode(String code);
}
