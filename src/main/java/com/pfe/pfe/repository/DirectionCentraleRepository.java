package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.DirectionCentrale;

@Repository

public interface DirectionCentraleRepository extends JpaRepository<DirectionCentrale , Integer>{

    
}