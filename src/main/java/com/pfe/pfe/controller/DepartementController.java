package com.pfe.pfe.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.entity.DepartementMetier;
import com.pfe.pfe.entity.DepartementMetierId;
import com.pfe.pfe.entity.Metier;
import com.pfe.pfe.repository.DepartementMetierRepository;
import com.pfe.pfe.service.DepartementService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/Api/departements")
public class DepartementController {

    @Autowired
    private DepartementService departementService;

    @Autowired
    private DepartementMetierRepository departementMetierRepository;

    @GetMapping
    public List<Departement> findAll() {
        return departementService.findAll();
    }

    @GetMapping("/{id}")
    public Departement findById(@PathVariable int id) {
        return departementService.findById(id);
    }

    // ✅ Nouveau endpoint : récupérer les départements filtrés par métier
    @GetMapping("/par-metier/{idMetier}")
    public List<Departement> getDepartementsByMetier(@PathVariable int idMetier) {
        return departementMetierRepository.findByMetierIdMetier(idMetier)
                .stream()
                .map(dm -> dm.getDepartement())
                .collect(Collectors.toList());
    }

    @PostMapping
    public Departement save(@RequestBody Departement departement) {
        return departementService.save(departement);
    }

    @PutMapping("/{id}")
    public Departement update(@PathVariable int id, @RequestBody Departement departement) {
        return departementService.save(departement);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id) {
        departementService.deleteById(id);
    }
    // ✅ Récupérer les métiers d'un département
@GetMapping("/{idDepartement}/metiers")
public List<Integer> getMetiersByDepartement(@PathVariable int idDepartement) {
    return departementMetierRepository.findByDepartementIdDepartement(idDepartement)
            .stream()
            .map(dm -> dm.getMetier().getIdMetier())
            .collect(Collectors.toList());
}

// ✅ Sauvegarder les métiers d'un département
@PostMapping("/{idDepartement}/metiers")
@Transactional
public void saveMetiersDepartement(@PathVariable int idDepartement, @RequestBody List<Integer> idMetiers) {
    // Supprimer les anciennes liaisons
    departementMetierRepository.deleteByDepartementIdDepartement(idDepartement);
    
    // Créer les nouvelles
    Departement dep = departementService.findById(idDepartement);
    for (int idMetier : idMetiers) {
        DepartementMetier dm = new DepartementMetier();
        DepartementMetierId id = new DepartementMetierId();
        id.setIdDepartement(idDepartement);
        id.setIdMetier(idMetier);
        dm.setDepartementMetierId(id);
        dm.setDepartement(dep);
        Metier m = new Metier();
        m.setIdMetier(idMetier);
        dm.setMetier(m);
        departementMetierRepository.save(dm);
    }
}
}