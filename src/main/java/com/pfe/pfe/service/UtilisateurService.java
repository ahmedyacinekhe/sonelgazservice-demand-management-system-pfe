package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.repository.DepartementRepository;
import com.pfe.pfe.repository.RoleUtilisateurRepository;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private RoleUtilisateurRepository roleUtilisateurRepository;
    @Autowired
    private DepartementRepository departementRepository;
    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    public List<Utilisateur> findAll() {
        return utilisateurRepository.findAll(Sort.by(Sort.Direction.ASC, "idUtil"));
    }

    public Utilisateur findById(int id) {
        return utilisateurRepository.findById(id).orElse(null);
    }

    public Utilisateur save(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void convertirUtilisateur(int idUtil, String nouveauRole, int idDepartement) {
        String nomRole = nouveauRole.toUpperCase();

        if (nomRole.equals("EMPLOYE") || nomRole.equals("RESPONSABLE") || nomRole.equals("ADMIN")) {

            Long countClient = (Long) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM client WHERE id_util = :id")
                .setParameter("id", idUtil)
                .getSingleResult();

            if (countClient > 0) {
                // CLIENT → EMPLOYE
                entityManager.createNativeQuery("DELETE FROM client WHERE id_util = :id")
                    .setParameter("id", idUtil)
                    .executeUpdate();

                entityManager.createNativeQuery(
                    "INSERT INTO employe (id_util, matricule, is_admin, date_embauche, id_departement) " +
                    "VALUES (:id, 0, false, null, :idDept)")
                    .setParameter("id", idUtil)
                    .setParameter("idDept", idDepartement > 0 ? idDepartement : null)
                    .executeUpdate();

                if (idDepartement > 0) {
                    Departement dept = departementRepository.findById(idDepartement).orElse(null);
                    if (dept != null) {
                        if (dept.getNombreEmployes() == null) dept.setNombreEmployes(0);
                        dept.setNombreEmployes(dept.getNombreEmployes() + 1);
                        departementRepository.save(dept);
                    }
                }

            } else {
                // Déjà EMPLOYE/RESPONSABLE/ADMIN → changer de département
                if (idDepartement > 0) {

                    Object idAncienDeptObj = entityManager
                        .createNativeQuery("SELECT id_departement FROM employe WHERE id_util = :id")
                        .setParameter("id", idUtil)
                        .getSingleResult();

                    int idAncienDept = idAncienDeptObj != null ? ((Number) idAncienDeptObj).intValue() : 0;

                    if (idAncienDept == 0) {
                        // Pas encore de département → incrémenter seulement
                        Departement dept = departementRepository.findById(idDepartement).orElse(null);
                        if (dept != null) {
                            if (dept.getNombreEmployes() == null) dept.setNombreEmployes(0);
                            dept.setNombreEmployes(dept.getNombreEmployes() + 1);
                            departementRepository.save(dept);
                        }

                    } else if (idAncienDept != idDepartement) {
                        // Département change → décrémenter ancien, incrémenter nouveau
                        Departement ancienDept = departementRepository.findById(idAncienDept).orElse(null);
                        if (ancienDept != null && ancienDept.getNombreEmployes() != null && ancienDept.getNombreEmployes() > 0) {
                            ancienDept.setNombreEmployes(ancienDept.getNombreEmployes() - 1);
                            departementRepository.save(ancienDept);
                        }

                        Departement nouveauDept = departementRepository.findById(idDepartement).orElse(null);
                        if (nouveauDept != null) {
                            if (nouveauDept.getNombreEmployes() == null) nouveauDept.setNombreEmployes(0);
                            nouveauDept.setNombreEmployes(nouveauDept.getNombreEmployes() + 1);
                            departementRepository.save(nouveauDept);
                        }
                    }
                    // Si idAncienDept == idDepartement → rien à faire

                    entityManager.createNativeQuery(
                        "UPDATE employe SET id_departement = :idDept WHERE id_util = :id")
                        .setParameter("idDept", idDepartement)
                        .setParameter("id", idUtil)
                        .executeUpdate();
                }
            }

        } else if (nomRole.equals("CLIENT")) {
            Long countEmploye = (Long) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM employe WHERE id_util = :id")
                .setParameter("id", idUtil)
                .getSingleResult();

            if (countEmploye > 0) {
                Object idAncienDept = entityManager
                    .createNativeQuery("SELECT id_departement FROM employe WHERE id_util = :id")
                    .setParameter("id", idUtil)
                    .getSingleResult();

                if (idAncienDept != null) {
                    int idDept = ((Number) idAncienDept).intValue();
                    Departement dept = departementRepository.findById(idDept).orElse(null);
                    if (dept != null && dept.getNombreEmployes() != null && dept.getNombreEmployes() > 0) {
                        dept.setNombreEmployes(dept.getNombreEmployes() - 1);
                        departementRepository.save(dept);
                    }
                }

                entityManager.createNativeQuery("DELETE FROM employe WHERE id_util = :id")
                    .setParameter("id", idUtil)
                    .executeUpdate();

                entityManager.createNativeQuery(
                    "INSERT INTO client (id_util, adresse_client, code_postal, type_client) " +
                    "VALUES (:id, '', 0, 'PARTICULIER')")
                    .setParameter("id", idUtil)
                    .executeUpdate();
            }
        }
    }

    @Transactional
    public void deleteById(int id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id).orElse(null);
        if (utilisateur == null) return;

        if (utilisateur instanceof Employe employe) {
            Departement departement = employe.getDepartement();
            if (departement != null && departement.getNombreEmployes() != null && departement.getNombreEmployes() > 0) {
                departement.setNombreEmployes(departement.getNombreEmployes() - 1);
                departementRepository.save(departement);
            }
            entityManager.createNativeQuery("DELETE FROM employe WHERE id_util = :id")
                .setParameter("id", id).executeUpdate();
        } else {
            entityManager.createNativeQuery("DELETE FROM client WHERE id_util = :id")
                .setParameter("id", id).executeUpdate();
        }

        entityManager.createNativeQuery("DELETE FROM role_utilisateur WHERE id_util = :id")
            .setParameter("id", id).executeUpdate();

        entityManager.clear();

        entityManager.createNativeQuery("DELETE FROM utilisateur WHERE id_util = :id")
            .setParameter("id", id).executeUpdate();
    }

    @Transactional
    public void updateEtat(int id, String etat) {
        entityManager.createNativeQuery("UPDATE utilisateur SET etat_compte = :etat WHERE id_util = :id")
            .setParameter("etat", etat)
            .setParameter("id", id)
            .executeUpdate();
    }
}