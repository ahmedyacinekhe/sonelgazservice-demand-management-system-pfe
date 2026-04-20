package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "departement")
@Getter
@Setter


public class Departement {
    @Id
    @Column(name="id_departement")
    private int idDepartement;

     @Column(name="nom_departement")
    private String nomDepartement;

    @Column(name="adresse_departement")
    private String adresseDepartement;

    @Column(name="contact_departement")
    private String contactDepartement;

    @Column(name="nombre_employes")
    private int nombreEmployes;

    @ManyToOne
    @JoinColumn(name="id_direction")
    private Direction direction;



}
