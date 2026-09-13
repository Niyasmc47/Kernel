package com.kernel.core.controller;

import com.kernel.core.service.CommunicationSessionService;
import com.kernel.core.service.session.CommunicationSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/communication")
public class CommunicationController {

    private final CommunicationSessionService communicationSessionService;

    public CommunicationController(CommunicationSessionService communicationSessionService) {
        this.communicationSessionService = communicationSessionService;
    }

    @GetMapping("/session")
    public ResponseEntity<?> getSession(
            @RequestParam("token") String token,
            @RequestParam(value = "grievanceId", required = false) String grievanceId) {
        try {
            CommunicationSession session = communicationSessionService.getSessionByTokenAndGrievance(token, grievanceId);
            String role = communicationSessionService.resolveRole(token, session);

            Map<String, Object> resp = new HashMap<>();
            resp.put("sessionId", session.getSessionId());
            resp.put("role", role);
            resp.put("grievanceId", session.getGrievanceId());
            resp.put("expiresAt", session.getExpiresAt());
            resp.put("visitorConnected", session.isVisitorConnected());
            resp.put("adminConnected", session.isAdminConnected());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Invalid or expired communication session"));
        }
    }
}

