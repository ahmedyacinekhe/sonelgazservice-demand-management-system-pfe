package com.pfe.pfe.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "client")
@Getter
@Setter

public class Client extends Utilisateur {

    @Column(name="adresse_client")
    private String adresseClient;

    @Column(name="code_postal")
    private int codePostal;

     @Column(name="type_client")
    private String typeClient;
    
}
