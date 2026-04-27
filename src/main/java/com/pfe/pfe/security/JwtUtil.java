package com.pfe.pfe.security;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;


@Component

public class JwtUtil {
    @Value("${spring.jwt.secret.key}")
    private String secretKey;
    @Value("${spring.jwt.date.expiration}")
    private Long dateExpiration;

    private Claims recupererInfo(String token){
        return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
    }
    
    public String recupererEmail(String token){
        return recupererInfo(token).getSubject();
    }
    
    private boolean estTokenExpire(String token){
        return recupererInfo(token).getExpiration().before(new Date());
    }

     public Boolean estTokenValide(String token ,String email){
      return recupererEmail(token).equals(email) && !estTokenExpire(token);
    } 


    public String genererToken(String email){
        return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + dateExpiration))
        .signWith(SignatureAlgorithm.HS256, secretKey)
        .compact();
    }
      



}