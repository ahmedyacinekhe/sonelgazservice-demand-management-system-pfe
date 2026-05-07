package com.pfe.pfe.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.pfe.pfe.entity.Reponse;
import com.pfe.pfe.entity.Demande;
import com.pfe.pfe.service.ReponseService;
import com.pfe.pfe.repository.DemandeRepository;

@RestController
@RequestMapping("/Api/reponses")
public class ReponseController {

    @Autowired
    private ReponseService reponseService;

    @Autowired
    private DemandeRepository demandeRepository;

    @GetMapping("/demande/{idDemande}")
    public List<Reponse> getByDemande(@PathVariable int idDemande) {
        return reponseService.findByDemande(idDemande);
    }

    // DTO interne pour recevoir la requête du frontend
    public static class ReponseRequest {
        public String contenuReponse;
        public DemandeRef demande;

        public static class DemandeRef {
            public int idDemande;
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody ReponseRequest request) {
        if (request.demande == null || request.demande.idDemande == 0) {
            return ResponseEntity.badRequest().body("idDemande manquant");
        }

        Demande demande = demandeRepository.findById(request.demande.idDemande).orElse(null);
        if (demande == null) {
            return ResponseEntity.badRequest().body("Demande introuvable");
        }

        Reponse reponse = new Reponse();
        reponse.setContenuReponse(request.contenuReponse);
        reponse.setDemande(demande);

        Reponse saved = reponseService.save(reponse);
        return ResponseEntity.ok(saved);
    }
}
