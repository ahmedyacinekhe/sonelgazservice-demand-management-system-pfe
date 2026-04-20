package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "etat_demande")
@Getter
@Setter

public class EtatDemande {
    @Id
    @Column(name="id_etat")
    private int idEtat;

    @Column(name="libelle_etat")
    private String libelleEtat;

    
}
