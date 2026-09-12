package com.kernel.core.service;

import com.kernel.core.exception.SessionExpiredException;
import com.kernel.core.service.session.ConversationSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

class ConversationSessionServiceTest {

    private ConversationSessionService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new ConversationSessionService();
        Field field = ConversationSessionService.class.getDeclaredField("sessionTtlMinutes");
        field.setAccessible(true);
        field.set(service, 30L);
    }

    @Test
    void createSessionReturnsValidSession() {
        ConversationSession session = service.createSession("en");
        assertNotNull(session.getId());
        assertEquals("en", session.getLanguage());
        assertFalse(session.isExpired());
    }

    @Test
    void getSessionReturnsExistingSession() {
        ConversationSession session = service.createSession("en");
        ConversationSession retrieved = service.getSession(session.getId());
        assertEquals(session, retrieved);
    }

    @Test
    void getSessionThrowsExceptionForNonexistentSession() {
        assertThrows(SessionExpiredException.class, () -> service.getSession("unknown"));
    }

    @Test
    void getSessionThrowsExceptionForExpiredSession() throws Exception {
        ConversationSession session = service.createSession("en");
        
        Field expiresAtField = ConversationSession.class.getDeclaredField("expiresAt");
        expiresAtField.setAccessible(true);
        expiresAtField.set(session, Instant.now().minus(1, ChronoUnit.MINUTES));

        assertThrows(SessionExpiredException.class, () -> service.getSession(session.getId()));
    }

    @Test
    void removeSessionRemovesTheSession() {
        ConversationSession session = service.createSession("en");
        service.removeSession(session.getId());
        assertThrows(SessionExpiredException.class, () -> service.getSession(session.getId()));
    }

    @Test
    void cleanupExpiredSessionsRemovesOnlyExpired() throws Exception {
        ConversationSession valid = service.createSession("en");
        ConversationSession expired = service.createSession("fr");

        Field expiresAtField = ConversationSession.class.getDeclaredField("expiresAt");
        expiresAtField.setAccessible(true);
        expiresAtField.set(expired, Instant.now().minus(1, ChronoUnit.MINUTES));

        service.cleanupExpiredSessions();

        assertDoesNotThrow(() -> service.getSession(valid.getId()));
        assertThrows(SessionExpiredException.class, () -> service.getSession(expired.getId()));
    }
}

