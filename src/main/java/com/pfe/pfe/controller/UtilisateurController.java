package com.pfe.pfe.controller;

import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.pfe.pfe.entity.Utilisateur;
import com.pfe.pfe.dto.PreferencesDTO;
import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.entity.Role;
import com.pfe.pfe.entity.RoleUtilisateur;
import com.pfe.pfe.entity.RoleUtilisateurId;
import com.pfe.pfe.service.UtilisateurService;
import com.pfe.pfe.service.RoleUtilisateurService;
import com.pfe.pfe.repository.RoleUtilisateurRepository;
import com.pfe.pfe.repository.RoleRepository;

@RestController
@RequestMapping("/Api/utilisateurs")
public class UtilisateurController {

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private RoleUtilisateurService roleUtilisateurService;

    @Autowired
    private RoleUtilisateurRepository roleUtilisateurRepository;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public List<Utilisateur> findAll(){
        return utilisateurService.findAll();
    }

    @GetMapping("/{id}")
    public Utilisateur findById(@PathVariable int id){
        return utilisateurService.findById(id);
    }

    // ✅ Endpoint unique : vérification + affectation + conversion
    @PostMapping("/{idUtil}/affecter-role")
    public ResponseEntity<?> affecterRole(
            @PathVariable int idUtil,
            @RequestParam int idRole,
            @RequestParam(defaultValue = "0") int idDepartement) {

        // 1. Trouver le rôle
        Role role = roleRepository.findById(idRole).orElse(null);
        if (role == null) return ResponseEntity.badRequest().body("Rôle introuvable !");

        String nomRole = role.getNomRole().toUpperCase();

        // 2. Vérifier si RESPONSABLE existe déjà dans ce département
        if (nomRole.equals("RESPONSABLE") && idDepartement > 0) {
            boolean dejaResponsable = roleUtilisateurRepository.findAll().stream()
                .filter(ru -> ru.getRole() != null &&
                              ru.getRole().getNomRole().toUpperCase().equals("RESPONSABLE") &&
                              ru.getRoleUtilisateurId().getIdUtil() != idUtil)
                .anyMatch(ru -> {
                    Utilisateur u = ru.getUtilisateur();
                    if (u instanceof Employe emp) {
                        return emp.getDepartement() != null &&
                               emp.getDepartement().getIdDepartement() == idDepartement;
                    }
                    return false;
                });

            if (dejaResponsable) {
                return ResponseEntity.badRequest()
                    .body("Un responsable existe déjà pour ce département !");
            }
        }

        // 3. Supprimer l'ancien rôle
        roleUtilisateurService.deleteByIdUtil(idUtil);

        // 4. Affecter le nouveau rôle
        RoleUtilisateur ru = new RoleUtilisateur();
        RoleUtilisateurId ruId = new RoleUtilisateurId();
        ruId.setIdUtil(idUtil);
        ruId.setIdRole(idRole);
        ru.setRoleUtilisateurId(ruId);
        roleUtilisateurService.save(ru);

        // 5. Convertir l'utilisateur
        utilisateurService.convertirUtilisateur(idUtil, nomRole, idDepartement);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/convertir")
    public ResponseEntity<?> convertirUtilisateur(
            @PathVariable int id,
            @RequestParam String nouveauRole,
            @RequestParam(defaultValue = "0") int idDepartement) {
        utilisateurService.convertirUtilisateur(id, nouveauRole, idDepartement);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public Utilisateur save(@RequestBody Utilisateur utilisateur){
        return utilisateurService.save(utilisateur);
    }

    @PutMapping("/{id}/etat")
    public void updateEtat(@PathVariable int id, @RequestParam String etat) {
        utilisateurService.updateEtat(id, etat);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        utilisateurService.deleteById(id);
    }
    @GetMapping("/me/preferences")
public ResponseEntity<PreferencesDTO> getPreferences(Principal principal) {
    return ResponseEntity.ok(utilisateurService.getPreferences(principal.getName()));
}

@PutMapping("/me/preferences")
public ResponseEntity<Void> updatePreferences(Principal principal, @RequestBody PreferencesDTO dto) {
    utilisateurService.updatePreferences(principal.getName(), dto);
    return ResponseEntity.ok().build();
}
}