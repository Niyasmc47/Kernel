package com.kernel.core.websocket;

import com.kernel.core.dto.websocket.ChatMessage;
import com.kernel.core.service.CommunicationSessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.Map;

@Controller
public class CommunicationWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(CommunicationWebSocketHandler.class);
    
    private final CommunicationSessionService communicationSessionService;
    private final SimpMessagingTemplate messagingTemplate;

    public CommunicationWebSocketHandler(CommunicationSessionService communicationSessionService, SimpMessagingTemplate messagingTemplate) {
        this.communicationSessionService = communicationSessionService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/communication.send")
    public void handleMessage(@Header("simpSessionAttributes") Map<String, Object> sessionAttributes, ChatMessage message) {
        if (sessionAttributes == null || !sessionAttributes.containsKey("sessionId") || !sessionAttributes.containsKey("role")) {
            return;
        }

        String sessionId = (String) sessionAttributes.get("sessionId");
        String roleStr = (String) sessionAttributes.get("role");

        communicationSessionService.getSessionById(sessionId);

        ChatMessage.SenderRole role = ChatMessage.SenderRole.valueOf(roleStr);
        message.setSender(role);
        message.setType(ChatMessage.MessageType.MESSAGE);
        message.setTimestamp(Instant.now());

        logger.info("Message routed for session ID: {}", sessionId);

        messagingTemplate.convertAndSend("/topic/communication/" + sessionId, message);
    }

    @EventListener
    public void handleSessionConnectEvent(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("sessionId")) {
            String sessionId = (String) sessionAttributes.get("sessionId");
            logger.info("Session connected: {}", sessionId);
        }
    }

    @EventListener
    public void handleSessionDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("sessionId")) {
            String sessionId = (String) sessionAttributes.get("sessionId");
            logger.info("Session disconnected: {}", sessionId);
            
            String roleStr = (String) sessionAttributes.get("role");
            if (roleStr != null) {
                try {
                    var session = communicationSessionService.getSessionById(sessionId);
                    if ("ADMIN".equals(roleStr)) {
                        session.setAdminConnected(false);
                    } else if ("VISITOR".equals(roleStr)) {
                        session.setVisitorConnected(false);
                    }
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
    }
}
