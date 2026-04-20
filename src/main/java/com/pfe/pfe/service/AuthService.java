package com.pfe.pfe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pfe.pfe.dto.LoginRequest;
import com.pfe.pfe.dto.LoginResponse;
import com.pfe.pfe.dto.RegisterClientRequest;
import com.pfe.pfe.dto.RegisterEmployeRequest;
import com.pfe.pfe.entity.Client;
import com.pfe.pfe.entity.Departement;
import com.pfe.pfe.entity.Employe;
import com.pfe.pfe.repository.ClientRepository;
import com.pfe.pfe.repository.DepartementRepository;
import com.pfe.pfe.repository.EmployeRepository;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.security.JwtUtil;
@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager ;
    @Autowired
    private JwtUtil jwtUtil ;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private EmployeRepository employeRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private DepartementRepository departementRepository;

    public LoginResponse login( LoginRequest request ){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken( request.getEmail(),request.getPassword()));

        String token = jwtUtil.genererToken(request.getEmail());
        return new LoginResponse(token);
    }


    public String registerClient(RegisterClientRequest request ){
        if(utilisateurRepository.findByEmailUtil(request.getEmailUtil()).isPresent()){
            throw new RuntimeException("Email déja utilisé !");
        }
        Client client = new Client() ;
        client.setNomUtil(request.getNomUtil()) ;
        client.setPrenomUtil(request.getPrenomUtil());
        client.setNumTel(request.getNumTel());
        client.setEmailUtil(request.getEmailUtil());
        client.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        client.setEtatCompte("ACTIF");
        client.setCodePostal(request.getCodePostal());
        client.setAdresseClient(request.getAdresseClient());
        client.setTypeClient(request.getTypeClient());

        clientRepository.save(client);
        return ("Compte Client crée avec succès !");

    }

    public String registerEmploye(RegisterEmployeRequest request){
        if(utilisateurRepository.findByEmailUtil(request.getEmailUtil()).isPresent()){
            throw new RuntimeException("Email déja utilisée !");
        }

        Employe employe = new Employe();

        employe.setNomUtil(request.getNomUtil()) ;
        employe.setPrenomUtil(request.getPrenomUtil());
        employe.setNumTel(request.getNumTel());
        employe.setEmailUtil(request.getEmailUtil());
        employe.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        employe.setEtatCompte("ACTIF");
        employe.setMatricule(request.getMatricule());
        employe.setDateEmbauche(request.getDateEmbauche());
        employe.setAdmin(false);

         Departement departement = departementRepository.findByNomDepartement(request.getNomDepartement()).orElseThrow(()-> new RuntimeException("Departement non trouvé !"));
          employe.setDepartement(departement);
         employeRepository.save(employe);


        return ("Compte Employe crée avec succès !");

       
    }
}





    
