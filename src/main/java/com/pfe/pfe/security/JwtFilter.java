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
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{


String header= request.getHeader("Authorization");
String token= null;
String email= null;
// hna derna email null parceque on supose f email= jwtUtil.recupererEmail(token) tplanti donc on est besoin email y93d null apres n3rfo why atani had la var ns79oha f loaduserbyusername 

//hna lokan ndiro brk if(header.startsWith("bearer")) wl header kan null y lancilna exception w l app plante
// donc lzm nverifyiw kbal header!= null kbal mydkhl f startwith bch mtplantich l app

if( header!= null && header.startsWith("Bearer")){
  token = header.substring(7);
 
// hna token madeclarinahch hna prsq ns7a9oh f les fonction lirahom jayin alabiha declarinah lfok b null
 email= jwtUtil.recupererEmail(token);
}

if(email!=null && SecurityContextHolder.getContext().getAuthentication()==null){
//hna kan lzm nverifyiw ida  email != null prsq loadUserByUsername(null) dirlna excption whdkhra kml 
// lzm nverifyiw SecurityContextHolder ida null sinon n ecrasiw les info likano fih mn kbal 
 
   UserDetails userDetails= userDetailsServiceImpl.loadUserByUsername(email);

   if(jwtUtil.estTokenValide(token, email)){
     
    UsernamePasswordAuthenticationToken tokenVerifie= new UsernamePasswordAuthenticationToken(
        userDetails, null, userDetails.getAuthorities()
    );

    tokenVerifie.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

    SecurityContextHolder.getContext().setAuthentication(tokenVerifie);



   }

}

filterChain.doFilter(request, response);
}
}