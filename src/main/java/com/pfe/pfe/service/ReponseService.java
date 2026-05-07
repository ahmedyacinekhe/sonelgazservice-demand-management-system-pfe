package com.pfe.pfe.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.pfe.pfe.entity.Reponse;
import com.pfe.pfe.repository.ReponseRepository;

@Service
public class ReponseService {

    @Autowired
    private ReponseRepository reponseRepository;

    public List<Reponse> findByDemande(int idDemande) {
        return reponseRepository.findByDemande_IdDemande(idDemande);
    }

    public Reponse save(Reponse reponse) {
        if (reponse.getDateReponse() == null) {
            reponse.setDateReponse(new java.sql.Date(System.currentTimeMillis()));
        }
        return reponseRepository.save(reponse);
    }
}
