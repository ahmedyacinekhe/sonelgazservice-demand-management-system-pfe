package com.pfe.pfe.entity;



import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "direction_centrale")
@Getter
@Setter


public class DirectionCentrale {
    @Id
    @Column(name="id_directioncentrale")
    private int idDirectionCentrale;

    @Column(name="nom_directioncentrale")
    private String nomDirectionCentrale;

    @Column(name="adresse_directioncentrale")
    private String adresseDirectionCentrale;

    @Column(name="contact_directioncentrale")
    private String contactDirectionCentrale;

    @ManyToOne
    @JoinColumn(name="id_filiale")
    private Filiale filiale;
    
}
