package com.kernel.core.websocket;

import com.kernel.core.exception.InvalidTokenException;
import com.kernel.core.exception.SessionExpiredException;
import com.kernel.core.service.session.CommunicationSession;
import com.kernel.core.service.CommunicationSessionService;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.util.Map;

@Component
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    private final CommunicationSessionService communicationSessionService;

    public WebSocketAuthInterceptor(CommunicationSessionService communicationSessionService) {
        this.communicationSessionService = communicationSessionService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        URI uri = request.getURI();
        String query = uri.getQuery();
        if (query == null) {
            return false;
        }

        String token = extractParam(query, "token");
        if (token == null) {
            return false;
        }

        String grievanceId = extractParam(query, "grievanceId");

        try {
            CommunicationSession session = communicationSessionService.getSessionByTokenAndGrievance(token, grievanceId);
            String role = communicationSessionService.resolveRole(token, session);

            attributes.put("token", token);
            attributes.put("sessionId", session.getSessionId());
            attributes.put("role", role);

            return true;
        } catch (InvalidTokenException | SessionExpiredException e) {
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        // No-op
    }

    private String extractParam(String query, String name) {
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length == 2 && name.equals(keyValue[0])) {
                try {
                    return java.net.URLDecoder.decode(keyValue[1], java.nio.charset.StandardCharsets.UTF_8);
                } catch (Exception e) {
                    return keyValue[1];
                }
            }
        }
        return null;
    }
}
