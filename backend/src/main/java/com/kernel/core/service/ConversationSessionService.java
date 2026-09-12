package com.kernel.core.service;

import com.kernel.core.service.session.ConversationSession;
import com.kernel.core.exception.SessionExpiredException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConversationSessionService {
    private static final Logger log = LoggerFactory.getLogger(ConversationSessionService.class);
    
    private final ConcurrentHashMap<String, ConversationSession> sessions = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();
    
    @Value("${kernel.conversation.session-ttl-minutes:30}")
    private long sessionTtlMinutes;

    public ConversationSession createSession(String language) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String sessionId = HexFormat.of().formatHex(bytes);
        
        ConversationSession session = new ConversationSession(sessionId);
        session.setLanguage(language);
        session.setExpiresAt(Instant.now().plusSeconds(sessionTtlMinutes * 60));
        
        sessions.put(sessionId, session);
        return session;
    }

    public ConversationSession getSession(String sessionId) {
        ConversationSession session = sessions.get(sessionId);
        if (session == null || session.isExpired()) {
            if (session != null) {
                sessions.remove(sessionId);
            }
            throw new SessionExpiredException("Session not found or expired");
        }
        return session;
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredSessions() {
        int count = 0;
        Iterator<Map.Entry<String, ConversationSession>> iterator = sessions.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, ConversationSession> entry = iterator.next();
            if (entry.getValue().isExpired()) {
                iterator.remove();
                count++;
            }
        }
        if (count > 0) {
            log.info("Cleaned up {} expired conversation sessions", count);
        }
    }
}
