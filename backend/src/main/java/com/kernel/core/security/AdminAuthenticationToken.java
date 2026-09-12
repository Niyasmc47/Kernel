package com.kernel.core.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class AdminAuthenticationToken extends AbstractAuthenticationToken {

    private final String subject;

    public AdminAuthenticationToken(String subject) {
        super(Collections.singleton(new SimpleGrantedAuthority("ROLE_ADMIN")));
        this.subject = subject;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return subject;
    }
}
