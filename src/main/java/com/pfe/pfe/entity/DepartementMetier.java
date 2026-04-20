package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "departement_metier")
@Getter
@Setter

public class DepartementMetier {
   
    @EmbeddedId
    private DepartementMetierId departementMetierId;

    @ManyToOne
    @JoinColumn(name="id_departement", insertable=false, updatable=false)
    private Departement departement;

    @ManyToOne
    @JoinColumn(name="id_metier", insertable=false, updatable=false)
    private Metier metier;

}
