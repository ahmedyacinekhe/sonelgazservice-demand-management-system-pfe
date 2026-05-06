package com.pfe.pfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfe.pfe.entity.RoleUtilisateur;
import com.pfe.pfe.entity.RoleUtilisateurId;

import jakarta.transaction.Transactional;
@Repository
public interface RoleUtilisateurRepository extends JpaRepository<RoleUtilisateur,RoleUtilisateurId> {
List<RoleUtilisateur> findByRoleUtilisateurId_IdUtil(int id);
@Transactional
void deleteByRoleUtilisateurId_IdUtil(int idUtil);
@Transactional
void deleteByRoleUtilisateurId_IdRole(int idRole);
}
