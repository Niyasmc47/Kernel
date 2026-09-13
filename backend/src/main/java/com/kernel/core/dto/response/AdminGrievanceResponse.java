package com.kernel.core.dto.response;

import java.time.Instant;

public class AdminGrievanceResponse {
    private String id;
    private String name;
    private Integer age;
    private String location;
    private String email;
    private String language;
    private String category;
    private String urgency;
    private String originalGrievance;
    private String aiSummary;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private String communicationStatus;
    private Instant communicationEnabledAt;
    private Instant communicationClosedAt;
    private String voiceNoteBase64;
    private String voiceNoteContentType;

    public AdminGrievanceResponse() {}

    public AdminGrievanceResponse(String id, String name, Integer age, String location, String email, String language, String category, String urgency, String originalGrievance, String aiSummary, String status, Instant createdAt, Instant updatedAt, String communicationStatus, Instant communicationEnabledAt, Instant communicationClosedAt) {
        this(id, name, age, location, email, language, category, urgency, originalGrievance, aiSummary, status, createdAt, updatedAt, communicationStatus, communicationEnabledAt, communicationClosedAt, null, null);
    }

    public AdminGrievanceResponse(String id, String name, Integer age, String location, String email, String language, String category, String urgency, String originalGrievance, String aiSummary, String status, Instant createdAt, Instant updatedAt, String communicationStatus, Instant communicationEnabledAt, Instant communicationClosedAt, String voiceNoteBase64, String voiceNoteContentType) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.location = location;
        this.email = email;
        this.language = language;
        this.category = category;
        this.urgency = urgency;
        this.originalGrievance = originalGrievance;
        this.aiSummary = aiSummary;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.communicationStatus = communicationStatus;
        this.communicationEnabledAt = communicationEnabledAt;
        this.communicationClosedAt = communicationClosedAt;
        this.voiceNoteBase64 = voiceNoteBase64;
        this.voiceNoteContentType = voiceNoteContentType;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getOriginalGrievance() { return originalGrievance; }
    public void setOriginalGrievance(String originalGrievance) { this.originalGrievance = originalGrievance; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public String getCommunicationStatus() { return communicationStatus; }
    public void setCommunicationStatus(String communicationStatus) { this.communicationStatus = communicationStatus; }
    public Instant getCommunicationEnabledAt() { return communicationEnabledAt; }
    public void setCommunicationEnabledAt(Instant communicationEnabledAt) { this.communicationEnabledAt = communicationEnabledAt; }
    public Instant getCommunicationClosedAt() { return communicationClosedAt; }
    public void setCommunicationClosedAt(Instant communicationClosedAt) { this.communicationClosedAt = communicationClosedAt; }
    public String getVoiceNoteBase64() { return voiceNoteBase64; }
    public void setVoiceNoteBase64(String voiceNoteBase64) { this.voiceNoteBase64 = voiceNoteBase64; }
    public String getVoiceNoteContentType() { return voiceNoteContentType; }
    public void setVoiceNoteContentType(String voiceNoteContentType) { this.voiceNoteContentType = voiceNoteContentType; }
}
