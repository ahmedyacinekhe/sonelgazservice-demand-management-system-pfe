package com.pfe.pfe.entity;


    

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "metier")

public class Metier {
  @Id
  @Column(name="id_metier")
  private int idMetier;

  @Column(name="libelle_metier")
  private String libelleMetier;



}
