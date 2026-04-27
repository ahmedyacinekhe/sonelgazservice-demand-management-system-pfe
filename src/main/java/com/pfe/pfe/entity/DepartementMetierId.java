package com.pfe.pfe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
@Embeddable
@Getter
@Setter

public class DepartementMetierId implements Serializable{
  
    @Column(name="id_departement")
    private int idDepartement;

    @Column(name="id_metier")
    private int idMetier;
}
