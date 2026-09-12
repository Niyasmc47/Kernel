package com.kernel.core.service;

import com.kernel.core.exception.InvalidTokenException;
import com.kernel.core.service.session.CommunicationSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

class CommunicationSessionServiceTest {

    private CommunicationSessionService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new CommunicationSessionService();
        Field field = CommunicationSessionService.class.getDeclaredField("sessionTtlMinutes");
        field.setAccessible(true);
        field.set(service, 60L);
    }

    @Test
    void createSessionReturnsValidTokens() {
        CommunicationSession session = service.createSession("grievance-1");
        assertNotNull(session.getSessionId());
        assertNotNull(session.getVisitorToken());
        assertNotNull(session.getAdminToken());
        assertNotEquals(session.getVisitorToken(), session.getAdminToken());
    }

    @Test
    void getSessionByTokenReturnsCorrectSession() {
        CommunicationSession session = service.createSession("grievance-1");
        assertEquals(session.getSessionId(), service.getSessionByToken(session.getVisitorToken()).getSessionId());
        assertEquals(session.getSessionId(), service.getSessionByToken(session.getAdminToken()).getSessionId());
    }

    @Test
    void getSessionByTokenThrowsExceptionForUnknownToken() {
        assertThrows(InvalidTokenException.class, () -> service.getSessionByToken("unknown-token"));
    }

    @Test
    void resolveRoleReturnsVisitorForVisitorToken() {
        CommunicationSession session = service.createSession("grievance-1");
        String role = service.resolveRole(session.getVisitorToken(), session);
        assertEquals("VISITOR", role);
    }

    @Test
    void resolveRoleReturnsAdminForAdminToken() {
        CommunicationSession session = service.createSession("grievance-1");
        String role = service.resolveRole(session.getAdminToken(), session);
        assertEquals("ADMIN", role);
    }

    @Test
    void resolveRoleThrowsExceptionForWrongToken() {
        CommunicationSession session = service.createSession("grievance-1");
        assertThrows(InvalidTokenException.class, () -> service.resolveRole("wrong-token", session));
    }

    @Test
    void closeSessionRemovesSessionAndTokens() {
        CommunicationSession session = service.createSession("grievance-1");
        service.closeSession(session.getSessionId());
        assertThrows(InvalidTokenException.class, () -> service.getSessionByToken(session.getVisitorToken()));
    }

    @Test
    void cleanupExpiredSessionsRemovesOnlyExpired() throws Exception {
        CommunicationSession valid = service.createSession("g-1");
        CommunicationSession expired = service.createSession("g-2");

        Field expiresAtField = CommunicationSession.class.getDeclaredField("expiresAt");
        expiresAtField.setAccessible(true);
        expiresAtField.set(expired, Instant.now().minus(1, ChronoUnit.MINUTES));

        service.cleanupExpiredSessions();

        assertDoesNotThrow(() -> service.getSessionByToken(valid.getVisitorToken()));
        assertThrows(InvalidTokenException.class, () -> service.getSessionByToken(expired.getVisitorToken()));
    }

    @Test
    void privacyCheckNoMessageFields() {
        for (Field f : CommunicationSession.class.getDeclaredFields()) {
            String name = f.getName().toLowerCase();
            assertFalse(name.contains("message"), "CommunicationSession must not store messages");
            assertFalse(name.contains("chat"), "CommunicationSession must not store chat history");
            assertFalse(name.contains("history"), "CommunicationSession must not store history");
            assertFalse(name.contains("transcript"), "CommunicationSession must not store transcripts");
        }
    }
}
