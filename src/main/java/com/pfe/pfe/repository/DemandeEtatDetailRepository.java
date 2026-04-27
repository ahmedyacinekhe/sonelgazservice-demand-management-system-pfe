package com.pfe.pfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.DemandeEtatDetail;
import com.pfe.pfe.entity.DemandeEtatDetailId;
@Repository

public interface DemandeEtatDetailRepository extends JpaRepository<DemandeEtatDetail,DemandeEtatDetailId> {
    }

    