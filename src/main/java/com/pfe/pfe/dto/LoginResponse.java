package com.pfe.pfe.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private String role;
    private List<String> permissions;

    public LoginResponse(String token, String role, List<String> permissions) {
        this.token = token;
        this.role = role;
        this.permissions = permissions;
    }
}