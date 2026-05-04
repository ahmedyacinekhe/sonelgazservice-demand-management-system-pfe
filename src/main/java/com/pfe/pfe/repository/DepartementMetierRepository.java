package com.pfe.pfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


import com.pfe.pfe.entity.DepartementMetier;
import com.pfe.pfe.entity.DepartementMetierId;

public interface DepartementMetierRepository extends JpaRepository<DepartementMetier, DepartementMetierId> {

    // déjà existant
    List<DepartementMetier> findByMetierIdMetier(int idMetier);

    // ✅ AJOUTER : récupérer les métiers d'un département
    List<DepartementMetier> findByDepartementIdDepartement(int idDepartement);

    // ✅ AJOUTER : supprimer toutes les liaisons d'un département
    void deleteByDepartementIdDepartement(int idDepartement);
}