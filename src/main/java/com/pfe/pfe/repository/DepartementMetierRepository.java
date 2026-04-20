package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.DepartementMetier;
import com.pfe.pfe.entity.DepartementMetierId;
@Repository
public interface  DepartementMetierRepository extends JpaRepository<DepartementMetier , DepartementMetierId> {
    
}
