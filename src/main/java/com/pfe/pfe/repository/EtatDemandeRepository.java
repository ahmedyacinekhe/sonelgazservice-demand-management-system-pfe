package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.EtatDemande;
@Repository
public interface EtatDemandeRepository extends JpaRepository<EtatDemande , Integer> {
    
}
