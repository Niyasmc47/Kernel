package com.kernel.core.service.session;

import java.time.Instant;

public class CommunicationSession {
    private String sessionId;
    private String grievanceId;
    private String visitorToken;
    private String adminToken;
    private boolean visitorConnected;
    private boolean adminConnected;
    private Instant createdAt;
    private Instant expiresAt;

    public CommunicationSession(String sessionId, String grievanceId, String visitorToken, String adminToken, Instant expiresAt) {
        this.sessionId = sessionId;
        this.grievanceId = grievanceId;
        this.visitorToken = visitorToken;
        this.adminToken = adminToken;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
        this.visitorConnected = false;
        this.adminConnected = false;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getGrievanceId() { return grievanceId; }
    public void setGrievanceId(String grievanceId) { this.grievanceId = grievanceId; }
    public String getVisitorToken() { return visitorToken; }
    public void setVisitorToken(String visitorToken) { this.visitorToken = visitorToken; }
    public String getAdminToken() { return adminToken; }
    public void setAdminToken(String adminToken) { this.adminToken = adminToken; }
    public boolean isVisitorConnected() { return visitorConnected; }
    public void setVisitorConnected(boolean visitorConnected) { this.visitorConnected = visitorConnected; }
    public boolean isAdminConnected() { return adminConnected; }
    public void setAdminConnected(boolean adminConnected) { this.adminConnected = adminConnected; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
