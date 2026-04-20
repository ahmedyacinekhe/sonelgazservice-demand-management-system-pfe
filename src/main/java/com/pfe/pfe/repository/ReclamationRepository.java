package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.Reclamation;
@Repository

public interface ReclamationRepository extends JpaRepository<Reclamation , Integer> {
    
}
