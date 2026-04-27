package com.pfe.pfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.pfe.entity.EtatDemande;
import com.pfe.pfe.service.EtatDemandeService;

@RestController
@RequestMapping("/Api/etatDemandes")
public class EtatDemandeController {
    
    @Autowired
    private EtatDemandeService  etatDemandeService ;

    @GetMapping
    public List<EtatDemande> findAll(){
        return etatDemandeService.findAll();
    }

    @GetMapping("/{id}")
    public EtatDemande findById(@PathVariable int id ){
        return etatDemandeService.findById(id);
    }

    @PostMapping
    public EtatDemande save(@RequestBody EtatDemande etatDemande){
        return etatDemandeService.save(etatDemande);
    }
    @PutMapping("/{id}")
    public EtatDemande update(@PathVariable int id, @RequestBody EtatDemande etatDemande){
        return etatDemandeService.save(etatDemande);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable int id){
        etatDemandeService.deleteById(id);
    }
}


