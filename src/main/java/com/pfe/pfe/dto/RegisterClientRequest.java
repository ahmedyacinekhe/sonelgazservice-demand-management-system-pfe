package com.pfe.pfe.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterClientRequest {

    private String nomUtil ;
    private String prenomUtil ;
    private int numTel ;
    private String emailUtil ;
    private String motDePasse ;

    private int codePostal ;
    private String adresseClient ;
    private String typeClient ;


    
}
