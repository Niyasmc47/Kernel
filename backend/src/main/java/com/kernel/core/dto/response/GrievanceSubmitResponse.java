package com.kernel.core.dto.response;

import java.time.Instant;

public class GrievanceSubmitResponse {
    private String id;
    private String status;
    private String message;
    private Instant createdAt;

    public GrievanceSubmitResponse() {}

    public GrievanceSubmitResponse(String id, String status, String message, Instant createdAt) {
        this.id = id;
        this.status = status;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
