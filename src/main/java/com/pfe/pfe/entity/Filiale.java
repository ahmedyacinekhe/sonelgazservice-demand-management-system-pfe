package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "filiale")
public class Filiale {
    @Id
    @Column(name="id_filiale")
    private int idFiliale;

    @Column(name="nom_filiale")
    private String nomFiliale;

     @Column(name="adresse_filiale")
    private String adresseFiliale;

     @Column(name="contact_filiale")
    private String contactFiliale;

}
