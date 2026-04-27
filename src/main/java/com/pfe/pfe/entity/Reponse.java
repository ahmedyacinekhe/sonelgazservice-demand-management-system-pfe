package com.pfe.pfe.entity;

import java.sql.Date;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "reponse")

public class Reponse {
    @Id
    @Column(name="id_reponse")
    private int idReponse;

    @Column(name="date_reponse")
    private Date dateReponse;

    @Column(name="contenu_reponse")
    private String contenuReponse;

   @ManyToOne
   @JoinColumn(name="id_demande")
   private Demande demande;


}
