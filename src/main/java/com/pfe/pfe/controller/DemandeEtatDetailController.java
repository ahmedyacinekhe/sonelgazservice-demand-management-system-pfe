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

import com.pfe.pfe.entity.DemandeEtatDetail;
import com.pfe.pfe.entity.DemandeEtatDetailId;
import com.pfe.pfe.service.DemandeEtatDetailService;

@RestController
@RequestMapping("/Api/demandeEtatDetails")
public class DemandeEtatDetailController {
    @Autowired
    private DemandeEtatDetailService demandeEtatDetailService ;

    @GetMapping
    public List<DemandeEtatDetail> findAll(){
        return demandeEtatDetailService.findAll();
    }
    @GetMapping("/{id}")
    public DemandeEtatDetail findById(@PathVariable DemandeEtatDetailId id){
         return demandeEtatDetailService.findById(id);
    } 
    @PostMapping
    public DemandeEtatDetail save(@RequestBody DemandeEtatDetail demandeEtatDetail){
        return demandeEtatDetailService.save(demandeEtatDetail);
    }
    @PutMapping("/{id}")
    public DemandeEtatDetail update(@PathVariable DemandeEtatDetailId id,@RequestBody DemandeEtatDetail demandeEtatDetail){
        return demandeEtatDetailService.save(demandeEtatDetail);
    }
    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable DemandeEtatDetailId id){
        demandeEtatDetailService.deleteById(id);
    }
}
