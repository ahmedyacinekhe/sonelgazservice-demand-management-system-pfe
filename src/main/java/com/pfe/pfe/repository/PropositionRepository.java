package com.pfe.pfe.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pfe.pfe.entity.Proposition;

public interface PropositionRepository extends JpaRepository<Proposition, Integer> {
    List<Proposition> findByUtilisateur_EmailUtil(String email);
    List<Proposition> findByDepartement_IdDepartement(int idDepartement);
}