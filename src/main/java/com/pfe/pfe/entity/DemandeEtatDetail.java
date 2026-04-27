package com.pfe.pfe.entity;

import java.sql.Date;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "demande_etat_detail")

public class DemandeEtatDetail {

    @EmbeddedId
    private DemandeEtatDetailId demandeEtatDetailId;

    @Column(name="date_etat")
    private Date dateEtat;

    @ManyToOne
    @JoinColumn(name="id_demande", insertable=false, updatable=false)
    private Demande demande;
 
    @ManyToOne
    @JoinColumn(name="id_etat", insertable=false, updatable=false)
    private EtatDemande etatDemande;

}
