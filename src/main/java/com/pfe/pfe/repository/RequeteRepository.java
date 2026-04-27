package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.Requete;
@Repository
public interface RequeteRepository extends JpaRepository<Requete, Integer> {
    
}
