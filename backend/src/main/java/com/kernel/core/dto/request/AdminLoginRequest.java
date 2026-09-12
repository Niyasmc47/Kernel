package com.kernel.core.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AdminLoginRequest {
    @NotBlank
    private String password;

    public AdminLoginRequest() {}

    public AdminLoginRequest(String password) {
        this.password = password;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
