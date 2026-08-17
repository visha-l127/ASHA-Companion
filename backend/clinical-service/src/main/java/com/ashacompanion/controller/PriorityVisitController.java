package com.ashacompanion.controller;

import com.ashacompanion.entity.PriorityVisit;
import com.ashacompanion.service.PriorityVisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/priority-visits")
public class PriorityVisitController {

    @Autowired
    private PriorityVisitService priorityVisitService;

    @GetMapping
    public ResponseEntity<List<PriorityVisit>> getAllPriorityVisits() {
        return ResponseEntity.ok(priorityVisitService.getAllPriorityVisits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriorityVisit> getPriorityVisitById(@PathVariable Long id) {
        return priorityVisitService.getPriorityVisitById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PriorityVisit> createPriorityVisit(@RequestBody PriorityVisit visit) {
        PriorityVisit created = priorityVisitService.createPriorityVisit(visit);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PriorityVisit> updatePriorityVisit(@PathVariable Long id, @RequestBody PriorityVisit visitDetails) {
        try {
            PriorityVisit updated = priorityVisitService.updatePriorityVisit(id, visitDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePriorityVisit(@PathVariable Long id) {
        try {
            priorityVisitService.deletePriorityVisit(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
