package com.pfe.pfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.pfe.pfe.entity.DemandeEtatDetail;
import com.pfe.pfe.entity.DemandeEtatDetailId;

public interface DemandeEtatDetailRepository extends JpaRepository<DemandeEtatDetail, DemandeEtatDetailId> {

    // ✅ Supprimer tous les états d'une demande (pour en mettre un nouveau)
    @Modifying
    @Transactional
    @Query("DELETE FROM DemandeEtatDetail d WHERE d.demandeEtatDetailId.idDemande = :idDemande")
    void deleteByIdDemande(int idDemande);
    @Query("SELECT d FROM DemandeEtatDetail d WHERE d.demandeEtatDetailId.idDemande = :idDemande")
List<DemandeEtatDetail> findByIdDemande(int idDemande);
}