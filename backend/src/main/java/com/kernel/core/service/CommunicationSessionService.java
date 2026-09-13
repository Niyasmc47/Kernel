package com.kernel.core.service;

import com.kernel.core.service.session.CommunicationSession;
import com.kernel.core.exception.SessionExpiredException;
import com.kernel.core.exception.InvalidTokenException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CommunicationSessionService {
    private static final Logger log = LoggerFactory.getLogger(CommunicationSessionService.class);

    private final ConcurrentHashMap<String, CommunicationSession> sessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> tokenToSessionId = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${kernel.communication.session-ttl-minutes:60}")
    private long sessionTtlMinutes;

    public CommunicationSession createSession(String grievanceId) {
        // Clean up previous active session for this grievance if any
        CommunicationSession existing = getSessionByGrievanceId(grievanceId);
        if (existing != null) {
            closeSession(existing.getSessionId());
        }

        String sessionId = generateToken();
        String visitorToken = generateToken();
        String adminToken = "kernelctygz";

        Instant expiresAt = Instant.now().plusSeconds(sessionTtlMinutes * 60);
        CommunicationSession session = new CommunicationSession(sessionId, grievanceId, visitorToken, adminToken, expiresAt);

        sessions.put(sessionId, session);
        tokenToSessionId.put(visitorToken, sessionId);
        tokenToSessionId.put(adminToken, sessionId);

        return session;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public CommunicationSession getSessionByGrievanceId(String grievanceId) {
        if (grievanceId == null || grievanceId.isBlank()) {
            return null;
        }
        return sessions.values().stream()
                .filter(s -> !s.isExpired() && grievanceId.equals(s.getGrievanceId()))
                .findFirst()
                .orElse(null);
    }

    public CommunicationSession getSessionByTokenAndGrievance(String token, String grievanceId) {
        if (grievanceId != null && !grievanceId.isBlank() && ("kernelctygz".equalsIgnoreCase(token) || "kernel".equalsIgnoreCase(token))) {
            CommunicationSession session = getSessionByGrievanceId(grievanceId);
            if (session != null && !session.isExpired()) {
                return session;
            }
        }
        return getSessionByToken(token);
    }

    public CommunicationSession getSessionByToken(String token) {
        if (token == null) {
            throw new InvalidTokenException("Invalid communication token");
        }
        String sessionId = tokenToSessionId.get(token);
        if (sessionId != null) {
            CommunicationSession session = sessions.get(sessionId);
            if (session != null && !session.isExpired()) {
                return session;
            }
        }
        if ("kernelctygz".equalsIgnoreCase(token) || "kernel".equalsIgnoreCase(token)) {
            return sessions.values().stream()
                    .filter(s -> !s.isExpired())
                    .findFirst()
                    .orElseThrow(() -> new InvalidTokenException("No active communication session"));
        }
        throw new InvalidTokenException("Session expired or invalid");
    }

    public CommunicationSession getSessionById(String sessionId) {
        CommunicationSession session = sessions.get(sessionId);
        if (session == null || session.isExpired()) {
            throw new SessionExpiredException("Session not found or expired");
        }
        return session;
    }

    public String resolveRole(String token, CommunicationSession session) {
        if (token != null && ("kernelctygz".equalsIgnoreCase(token) || "kernel".equalsIgnoreCase(token))) {
            return "ADMIN";
        }
        if (session.getAdminToken() != null && MessageDigest.isEqual(token.getBytes(), session.getAdminToken().getBytes())) {
            return "ADMIN";
        }
        if (session.getVisitorToken() != null && MessageDigest.isEqual(token.getBytes(), session.getVisitorToken().getBytes())) {
            return "VISITOR";
        }
        throw new InvalidTokenException("Invalid token for session");
    }

    public void closeSession(String sessionId) {
        CommunicationSession session = sessions.remove(sessionId);
        if (session != null) {
            tokenToSessionId.remove(session.getVisitorToken());
            tokenToSessionId.remove(session.getAdminToken());
            log.info("Closed communication session");
        }
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredSessions() {
        int count = 0;
        Iterator<Map.Entry<String, CommunicationSession>> iterator = sessions.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, CommunicationSession> entry = iterator.next();
            if (entry.getValue().isExpired()) {
                CommunicationSession session = entry.getValue();
                tokenToSessionId.remove(session.getVisitorToken());
                tokenToSessionId.remove(session.getAdminToken());
                iterator.remove();
                count++;
            }
        }
        if (count > 0) {
            log.info("Cleaned up {} expired communication sessions", count);
        }
    }
}
