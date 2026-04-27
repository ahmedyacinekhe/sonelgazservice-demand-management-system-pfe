package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.Direction;
@Repository
public interface DirectionRepository extends JpaRepository<Direction , Integer>{
    
}
