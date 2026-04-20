package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pfe.pfe.entity.Proposition;

@Repository

public interface PropositionRepository extends JpaRepository<Proposition , Integer> {
    
}
