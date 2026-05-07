package com.pfe.pfe.entity;

import java.sql.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "reponse")
public class Reponse {

    
    @Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reponse_seq")
@SequenceGenerator(name = "reponse_seq", sequenceName = "reponse_id_reponse_seq", allocationSize = 1)
@Column(name="id_reponse")
private int idReponse;

    @Column(name = "date_reponse")
    private Date dateReponse;

    @Column(name = "contenu_reponse")
    private String contenuReponse;

    @ManyToOne
    @JoinColumn(name = "id_demande")
    @JsonIgnoreProperties({"reponses", "utilisateur", "departement", "etat", "metier"})
    private Demande demande;
}
