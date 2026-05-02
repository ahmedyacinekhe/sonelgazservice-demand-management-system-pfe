package com.pfe.pfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.Employe;
@Repository

public interface EmployeRepository extends JpaRepository<Employe, Integer> {
     boolean existsByEmailUtil(String emailUtil);
     List<Employe> findByDepartement_IdDepartement(int idDepartement);
}
