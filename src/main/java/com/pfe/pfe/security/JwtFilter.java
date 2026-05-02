package com.pfe.pfe.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String token = null;
        String email = null;

        try {
            if (header != null && header.startsWith("Bearer ")) {
                token = header.substring(7);
                email = jwtUtil.recupererEmail(token);
                System.out.println("✅ Email extrait: " + email);
            } else {
                System.out.println("❌ Header Authorization manquant ou invalide: " + header);
            }

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(email);
                System.out.println("✅ Authorities: " + userDetails.getAuthorities());

                if (jwtUtil.estTokenValide(token, email)) {
                    UsernamePasswordAuthenticationToken tokenVerifie = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    tokenVerifie.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(tokenVerifie);
                    System.out.println("✅ Authentification réussie !");
                } else {
                    System.out.println("❌ Token invalide !");
                }
            }
        } catch (Exception e) {
            System.out.println("❌ Erreur JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}