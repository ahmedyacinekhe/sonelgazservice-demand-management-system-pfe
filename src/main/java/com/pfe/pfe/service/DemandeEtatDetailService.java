package com.pfe.pfe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfe.pfe.entity.DemandeEtatDetail;
import com.pfe.pfe.entity.DemandeEtatDetailId;
import com.pfe.pfe.repository.DemandeEtatDetailRepository;

@Service
public class DemandeEtatDetailService {

    @Autowired
    private DemandeEtatDetailRepository demandeEtatDetailRepository ;
 
   public List<DemandeEtatDetail> findAll(){
       return demandeEtatDetailRepository.findAll();
   }

   public DemandeEtatDetail findById(DemandeEtatDetailId id){
        return demandeEtatDetailRepository.findById(id).orElse(null);
   }

   public DemandeEtatDetail save(DemandeEtatDetail  demandeEtatDetail){
    return demandeEtatDetailRepository.save(demandeEtatDetail);
   }
    
   public void deleteById(DemandeEtatDetailId id){
    demandeEtatDetailRepository.deleteById(id);
   }
}
