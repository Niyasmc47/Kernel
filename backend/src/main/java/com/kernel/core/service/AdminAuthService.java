package com.kernel.core.service;

import com.kernel.core.dto.response.AdminLoginResponse;
import com.kernel.core.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.MessageDigest;
import java.util.Date;

@Service
public class AdminAuthService {

    @Value("${kernel.admin.password}")
    private String adminPassword;

    @Value("${kernel.security.jwt-secret}")
    private String jwtSecret;

    @Value("${kernel.security.jwt-expiration-ms:86400000}")
    private long jwtExpirationMs;

    public AdminLoginResponse authenticate(String password) {
        if (!MessageDigest.isEqual(password.getBytes(), adminPassword.getBytes())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        String token = Jwts.builder()
                .subject("admin")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();

        AdminLoginResponse response = new AdminLoginResponse();
        response.setToken(token);
        response.setExpiresAt(expiryDate.toInstant());
        return response;
    }

    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractSubject(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}
