package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.Demande;
@Repository

public interface DemandeRepository extends JpaRepository<Demande, Integer> {
    
}
