package com.pfe.pfe.service;

import java.util.List;
import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.repository.DepartementRepository;
import com.pfe.pfe.repository.EmployeRepository;

@Service
public class EmployeService {

    @Autowired
    private EmployeRepository employeRepository;
    @Autowired
    private DepartementRepository departementRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public void changerDepartement(int idUtil, int idDepartement) {
        Utilisateur utilisateur = utilisateurRepository.findById(idUtil)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Departement nouveauDept = departementRepository.findById(idDepartement)
            .orElseThrow(() -> new RuntimeException("Département non trouvé"));

        if (utilisateur instanceof Employe employe) {
            Departement ancienDept = employe.getDepartement();
            if (ancienDept != null && ancienDept.getNombreEmployes() != null && ancienDept.getNombreEmployes() > 0) {
                ancienDept.setNombreEmployes(ancienDept.getNombreEmployes() - 1);
                departementRepository.save(ancienDept);
            }
            employe.setDepartement(nouveauDept);
            employeRepository.save(employe);
        }

        if (nouveauDept.getNombreEmployes() == null) nouveauDept.setNombreEmployes(0);
        nouveauDept.setNombreEmployes(nouveauDept.getNombreEmployes() + 1);
        departementRepository.save(nouveauDept);
    }

    public List<Employe> findAll() {
        return employeRepository.findAll();
    }

    public List<Employe> findByDepartement(int idDepartement) {
        return employeRepository.findByDepartement_IdDepartement(idDepartement);
    }

    public Employe findById(int id) {
        return employeRepository.findById(id).orElse(null);
    }

    public Employe save(Employe employe) {
        Employe saved = employeRepository.save(employe);

        Departement dept = employe.getDepartement();
        if (dept != null) {
            if (dept.getNombreEmployes() == null) dept.setNombreEmployes(0);
            dept.setNombreEmployes(dept.getNombreEmployes() + 1);
            departementRepository.save(dept);
        }

        return saved;
    }

    public void deleteById(int id) {
        Employe employe = employeRepository.findById(id).orElse(null);
        if (employe != null) {
            Departement dept = employe.getDepartement();
            if (dept != null && dept.getNombreEmployes() != null && dept.getNombreEmployes() > 0) {
                dept.setNombreEmployes(dept.getNombreEmployes() - 1);
                departementRepository.save(dept);
            }
        }
        employeRepository.deleteById(id);
    }
}