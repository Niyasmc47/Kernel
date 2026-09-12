package com.kernel.core.dto.response;

import java.time.Instant;

public class GrievanceResponse {
    private String id;
    private String name;
    private String category;
    private String urgency;
    private String status;
    private Instant createdAt;
    private boolean communicationEnabled;

    public GrievanceResponse() {}

    public GrievanceResponse(String id, String name, String category, String urgency, String status, Instant createdAt, boolean communicationEnabled) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.urgency = urgency;
        this.status = status;
        this.createdAt = createdAt;
        this.communicationEnabled = communicationEnabled;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public boolean isCommunicationEnabled() { return communicationEnabled; }
    public void setCommunicationEnabled(boolean communicationEnabled) { this.communicationEnabled = communicationEnabled; }
}
