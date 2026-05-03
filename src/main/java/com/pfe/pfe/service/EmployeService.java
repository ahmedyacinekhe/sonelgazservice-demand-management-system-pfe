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
    private EmployeRepository employeRepository ;
@Autowired
private DepartementRepository departementRepository;
@Autowired
private UtilisateurRepository utilisateurRepository;


public void changerDepartement(int idUtil, int idDepartement) {
    System.out.println("🔍 changerDepartement appelé: idUtil=" + idUtil + ", idDepartement=" + idDepartement);
    
    Utilisateur utilisateur = utilisateurRepository.findById(idUtil)
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    
    System.out.println("✅ Utilisateur trouvé: " + utilisateur.getEmailUtil());

    Departement nouveauDept = departementRepository.findById(idDepartement)
        .orElseThrow(() -> new RuntimeException("Département non trouvé"));

    System.out.println("✅ Département trouvé: " + nouveauDept.getNomDepartement());

    if (utilisateur instanceof Employe employe) {
        System.out.println("✅ C'est un employé !");
        Departement ancienDept = employe.getDepartement();
        if (ancienDept != null && ancienDept.getNombreEmployes() > 0) {
            ancienDept.setNombreEmployes(ancienDept.getNombreEmployes() - 1);
            departementRepository.save(ancienDept);
        }
        employe.setDepartement(nouveauDept);
        employeRepository.save(employe);
    } else {
        System.out.println("❌ PAS un employé - type: " + utilisateur.getClass().getSimpleName());
    }

    nouveauDept.setNombreEmployes(nouveauDept.getNombreEmployes() + 1);
    departementRepository.save(nouveauDept);
}

    public List<Employe> findAll(){
        return employeRepository.findAll();
    }
    public List<Employe> findByDepartement(int idDepartement) {
    return employeRepository.findByDepartement_IdDepartement(idDepartement);
}

    public Employe findById(int id){
        return employeRepository.findById(id).orElse(null);
    }

    public Employe save(Employe employe){
        return employeRepository.save(employe);
    }


    public void deleteById(int id){
        employeRepository.deleteById(id);
    }

}