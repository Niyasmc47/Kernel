package com.kernel.core.privacy;

import com.kernel.core.model.Grievance;
import com.kernel.core.service.session.CommunicationSession;
import com.kernel.core.service.CommunicationSessionService;
import com.kernel.core.websocket.CommunicationWebSocketHandler;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertFalse;

class PrivacyChatNotPersistedTest {

    @Test
    void communicationSessionHasNoMessageFields() {
        assertNoMessageFields(CommunicationSession.class);
    }

    @Test
    void grievanceHasNoMessageFields() {
        assertNoMessageFields(Grievance.class);
    }

    @Test
    void communicationSessionServiceDoesNotStoreMessages() {
        boolean handlesMessages = false;
        for (Method m : CommunicationSessionService.class.getDeclaredMethods()) {
            String name = m.getName().toLowerCase();
            if (name.contains("message") || name.contains("chat") || name.contains("history")) {
                handlesMessages = true;
                break;
            }
        }
        assertFalse(handlesMessages, "CommunicationSessionService should not process message content");
    }

    @Test
    void webSocketHandlerDoesNotInjectRepository() {
        boolean hasRepository = false;
        for (Field f : CommunicationWebSocketHandler.class.getDeclaredFields()) {
            if (f.getType().getSimpleName().contains("Repository")) {
                hasRepository = true;
                break;
            }
        }
        assertFalse(hasRepository, "CommunicationWebSocketHandler must NOT have a repository to persist messages");
    }

    private void assertNoMessageFields(Class<?> clazz) {
        boolean hasMessageField = Arrays.stream(clazz.getDeclaredFields())
                .map(f -> f.getName().toLowerCase())
                .anyMatch(name -> name.contains("message") || 
                                  name.contains("chat") || 
                                  name.contains("history") || 
                                  name.contains("transcript"));
        assertFalse(hasMessageField, "Class " + clazz.getSimpleName() + " contains chat/message fields, violating privacy constraints.");
    }
}

