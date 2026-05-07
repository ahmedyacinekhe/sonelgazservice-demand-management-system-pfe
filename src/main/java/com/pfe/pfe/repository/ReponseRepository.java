package com.pfe.pfe.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pfe.pfe.entity.Reponse;

@Repository
public interface ReponseRepository extends JpaRepository<Reponse, Integer> {
    List<Reponse> findByDemande_IdDemande(int idDemande);
}
