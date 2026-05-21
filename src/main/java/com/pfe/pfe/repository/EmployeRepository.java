package com.pfe.pfe.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.pfe.pfe.entity.Employe;

@Repository
public interface EmployeRepository extends JpaRepository<Employe, Integer> {
    boolean existsByEmailUtil(String emailUtil);
    List<Employe> findByDepartement_IdDepartement(int idDepartement);
    Optional<Employe> findByEmailUtil(String emailUtil);

    @Query("SELECT e FROM Employe e " +
           "JOIN RoleUtilisateur ru ON ru.utilisateur.idUtil = e.idUtil " +
           "WHERE e.departement.idDepartement = :idDepartement " +
           "AND ru.role.nomRole = 'RESPONSABLE'")
    List<Employe> findResponsablesByDepartement(@Param("idDepartement") int idDepartement);
}