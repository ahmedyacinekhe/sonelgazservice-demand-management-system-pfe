package com.pfe.pfe.entity;

import java.sql.Date;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "employe")

public class Employe extends Utilisateur {
 
    @Column(name="matricule")
    private int matricule;

     @Column(name="is_admin")
    private boolean isAdmin;

     @Column(name="date_embauche")
    private Date dateEmbauche;

    @ManyToOne
    @JoinColumn(name="id_departement")
    private Departement departement;
    
}
