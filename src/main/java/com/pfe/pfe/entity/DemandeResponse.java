package com.pfe.pfe.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DemandeResponse {
    private Object demande;
    private String etat;
    private int idDemande;

    public DemandeResponse(Object demande, String etat, int idDemande) {
        this.demande = demande;
        this.etat = etat;
        this.idDemande = idDemande;
    }
}