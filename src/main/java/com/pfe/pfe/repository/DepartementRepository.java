package com.pfe.pfe.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.Departement;


@Repository

public interface DepartementRepository extends JpaRepository<Departement, Integer> {
    Optional<Departement> findByNomDepartement(String nomDepartement);
    
}
