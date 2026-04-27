package com.pfe.pfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.pfe.dto.LoginRequest;
import com.pfe.pfe.dto.LoginResponse;
import com.pfe.pfe.dto.RegisterClientRequest;
import com.pfe.pfe.dto.RegisterEmployeRequest;
import com.pfe.pfe.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService ;
    @PostMapping("/login")
    
    public LoginResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }
    @PostMapping("/register/client")
    
    public String registerClient(@RequestBody RegisterClientRequest request) {
        return authService.registerClient(request);
    }


    @PostMapping("/register/employe")

    public String registerEmploy(@RequestBody RegisterEmployeRequest request){
        return authService.registerEmploye(request);
    }
    
    
    
}
