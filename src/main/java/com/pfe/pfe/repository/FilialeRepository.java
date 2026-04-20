package com.pfe.pfe.repository;
import com.pfe.pfe.entity.Filiale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FilialeRepository extends JpaRepository<Filiale, Integer> {
    }
