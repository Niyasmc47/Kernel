package com.kernel.core.dto.response;

import java.time.Instant;

public class CommunicationEnableResponse {
    private String visitorToken;
    private String visitorLink;
    private String adminToken;
    private Instant expiresAt;

    public CommunicationEnableResponse() {}

    public CommunicationEnableResponse(String visitorToken, String visitorLink, String adminToken, Instant expiresAt) {
        this.visitorToken = visitorToken;
        this.visitorLink = visitorLink;
        this.adminToken = adminToken;
        this.expiresAt = expiresAt;
    }

    public String getVisitorToken() { return visitorToken; }
    public void setVisitorToken(String visitorToken) { this.visitorToken = visitorToken; }
    public String getVisitorLink() { return visitorLink; }
    public void setVisitorLink(String visitorLink) { this.visitorLink = visitorLink; }
    public String getAdminToken() { return adminToken; }
    public void setAdminToken(String adminToken) { this.adminToken = adminToken; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
