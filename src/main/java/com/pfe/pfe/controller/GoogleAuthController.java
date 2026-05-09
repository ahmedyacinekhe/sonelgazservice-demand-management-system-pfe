package com.pfe.pfe.controller;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.pfe.entity.Client;
import com.pfe.pfe.repository.ClientRepository;
import com.pfe.pfe.repository.EmployeRepository;
import com.pfe.pfe.repository.RolePermissionRepository;
import com.pfe.pfe.repository.RoleUtilisateurRepository;
import com.pfe.pfe.repository.UtilisateurRepository;
import com.pfe.pfe.security.JwtUtil;
import com.pfe.pfe.service.AuthService;
import com.pfe.pfe.dto.RegisterClientRequest;
import com.pfe.pfe.dto.RegisterEmployeRequest;

@RestController
@RequestMapping("/auth")
public class GoogleAuthController {

    @Autowired private ClientRepository clientRepository;
    @Autowired private EmployeRepository employeRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private RoleUtilisateurRepository roleUtilisateurRepository;
    @Autowired private RolePermissionRepository rolePermissionRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        System.out.println("✅ /auth/google appelé !");
        String idTokenString = body.get("token");

        try {
            String[] parts = idTokenString.split("\\.");
            String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = new ObjectMapper().readValue(payloadJson, Map.class);

            String email = (String) payload.get("email");
            String prenom = (String) payload.get("given_name");
            String nom = (String) payload.get("family_name");

            System.out.println("✅ Email Google: " + email);

            // Vérifier si l'utilisateur existe déjà
            var utilisateurOpt = utilisateurRepository.findByEmailUtil(email);

            if (utilisateurOpt.isEmpty()) {
                // Nouvel utilisateur → demander de compléter le profil
                return ResponseEntity.ok(Map.of(
                    "newUser", true,
                    "email", email != null ? email : "",
                    "prenom", prenom != null ? prenom : "",
                    "nom", nom != null ? nom : ""
                ));
            }

            // Utilisateur existant → connecter
            var utilisateur = utilisateurOpt.get();
            int idUtil = utilisateur.getIdUtil();

            var rolesUtil = roleUtilisateurRepository.findByRoleUtilisateurId_IdUtil(idUtil);
            String role = rolesUtil.isEmpty() ? "CLIENT" : rolesUtil.get(0).getRole().getNomRole();

            int idRole = rolesUtil.stream().findFirst()
                .map(ru -> ru.getRole().getIdRole()).orElse(0);

            List<String> permissions = rolePermissionRepository
                .findByRolePermissionId_IdRole(idRole)
                .stream()
                .map(rp -> rp.getPermission().getNomPermission())
                .collect(java.util.stream.Collectors.toList());

            String token = jwtUtil.genererToken(email, role);
            return ResponseEntity.ok(Map.of(
                "newUser", false,
                "token", token,
                "role", role,
                "permissions", permissions
            ));

        } catch (Exception e) {
            System.out.println("❌ Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/google/complete")
    public ResponseEntity<?> googleComplete(@RequestBody Map<String, Object> body) {
        try {
            String type = (String) body.get("type"); // "CLIENT" ou "EMPLOYE"
            String email = (String) body.get("emailUtil");

            if ("CLIENT".equals(type)) {
    RegisterClientRequest req = new RegisterClientRequest();
    req.setEmailUtil(email);
    req.setNomUtil((String) body.get("nomUtil"));
    req.setPrenomUtil((String) body.get("prenomUtil"));
    req.setNumTel(Long.parseLong(body.getOrDefault("numTel", "0").toString()));
    req.setMotDePasse("GOOGLE_AUTH_" + System.currentTimeMillis());
    req.setAdresseClient((String) body.get("adresseClient"));
    req.setCodePostal(Integer.parseInt(body.getOrDefault("codePostal", "0").toString()));
    req.setTypeClient((String) body.get("typeClient"));
    authService.registerClient(req);

} else if ("EMPLOYE".equals(type)) {
    RegisterEmployeRequest req = new RegisterEmployeRequest();
    req.setEmailUtil(email);
    req.setNomUtil((String) body.get("nomUtil"));
    req.setPrenomUtil((String) body.get("prenomUtil"));
    req.setNumTel(Long.parseLong(body.getOrDefault("numTel", "0").toString()));
    req.setMotDePasse("GOOGLE_AUTH_" + System.currentTimeMillis());
    req.setMatricule(Integer.parseInt(body.getOrDefault("matricule", "0").toString()));
    req.setNomDepartement((String) body.get("nomDepartement"));
    Object dateObj = body.get("dateEmbauche");
java.sql.Date dateEmbauche = dateObj != null
    ? java.sql.Date.valueOf(dateObj.toString())
    : new java.sql.Date(System.currentTimeMillis());
req.setDateEmbauche(dateEmbauche);
    authService.registerEmploye(req);
}

            
            // Connecter après inscription
var utilisateur = utilisateurRepository.findByEmailUtil(email).orElseThrow();
int idUtil = utilisateur.getIdUtil();

// Attendre que la transaction soit bien commitée
String role = "CLIENT";
if ("EMPLOYE".equals(type)) role = "EMPLOYE";

// Récupérer les permissions
var rolesUtil = roleUtilisateurRepository.findByRoleUtilisateurId_IdUtil(idUtil);
int idRole = rolesUtil.stream()
    .filter(ru -> ru.getRole() != null)
    .findFirst()
    .map(ru -> ru.getRole().getIdRole())
    .orElse(0);

List<String> permissions = idRole > 0
    ? rolePermissionRepository
        .findByRolePermissionId_IdRole(idRole)
        .stream()
        .map(rp -> rp.getPermission().getNomPermission())
        .collect(java.util.stream.Collectors.toList())
    : new ArrayList<>();

String token = jwtUtil.genererToken(email, role);
return ResponseEntity.ok(Map.of(
    "token", token,
    "role", role,
    "permissions", permissions
));

        } catch (Exception e) {
            System.out.println("❌ Erreur complete: " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
}