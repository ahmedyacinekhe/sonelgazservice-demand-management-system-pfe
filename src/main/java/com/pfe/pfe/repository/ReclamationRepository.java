package com.pfe.pfe.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pfe.pfe.entity.Reclamation;

public interface ReclamationRepository extends JpaRepository<Reclamation, Integer> {
    List<Reclamation> findByUtilisateur_EmailUtil(String email);
    List<Reclamation> findByDepartement_IdDepartement(int idDepartement);
}