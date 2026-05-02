package com.pfe.pfe.dto;

import java.sql.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterEmployeRequest {

    private String nomUtil ;
    private String prenomUtil ;
    private long numTel;
    private String emailUtil ;
    private String motDePasse ;

    private int matricule ;
    private Date dateEmbauche ;
    private String nomDepartement ;
    
}
