package com.pfe.pfe.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pfe.pfe.entity.Requete;

public interface RequeteRepository extends JpaRepository<Requete, Integer> {
    List<Requete> findByUtilisateur_EmailUtil(String email);
    List<Requete> findByDepartement_IdDepartement(int idDepartement);
}