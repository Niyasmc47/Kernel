package com.kernel.core.service;

import com.kernel.core.dto.response.AdminLoginResponse;
import com.kernel.core.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

class AdminAuthServiceTest {

    private AdminAuthService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new AdminAuthService();
        setPrivateField("adminPassword", "testpassword123");
        setPrivateField("jwtSecret", "test-secret-key-that-is-long-enough-for-hmac-sha256");
        setPrivateField("jwtExpirationMs", 3600000L);
    }

    private void setPrivateField(String fieldName, Object value) throws Exception {
        Field field = AdminAuthService.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(service, value);
    }

    @Test
    void authenticateReturnsTokenForCorrectPassword() {
        AdminLoginResponse response = service.authenticate("testpassword123");
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertFalse(response.getToken().isEmpty());
        assertNotNull(response.getExpiresAt());
    }

    @Test
    void authenticateThrowsExceptionForWrongPassword() {
        assertThrows(UnauthorizedException.class, () -> service.authenticate("wrongpassword"));
    }

    @Test
    void validateTokenReturnsTrueForValidToken() {
        AdminLoginResponse response = service.authenticate("testpassword123");
        assertTrue(service.validateToken(response.getToken()));
    }

    @Test
    void validateTokenReturnsFalseForInvalidToken() {
        assertFalse(service.validateToken("invalid.token.here"));
    }

    @Test
    void validateTokenReturnsFalseForGarbageString() {
        assertFalse(service.validateToken("not-even-a-jwt"));
    }

    @Test
    void extractSubjectReturnsCorrectSubject() {
        AdminLoginResponse response = service.authenticate("testpassword123");
        assertEquals("admin", service.extractSubject(response.getToken()));
    }

    @Test
    void passwordComparisonIsSecure() {
        // Trailing space should fail
        assertThrows(UnauthorizedException.class, () -> service.authenticate("testpassword123 "));
        // Prefix should fail
        assertThrows(UnauthorizedException.class, () -> service.authenticate("xtestpassword123"));
        // Empty should fail
        assertThrows(UnauthorizedException.class, () -> service.authenticate(""));
    }
}
