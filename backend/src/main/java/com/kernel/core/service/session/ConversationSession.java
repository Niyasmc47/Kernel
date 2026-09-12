package com.kernel.core.service.session;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ConversationSession {
    private String id;
    private String language;
    private String name;
    private Integer age;
    private String location;
    private String email;
    private List<Map<String, String>> conversationHistory;
    private String stage;
    private Instant createdAt;
    private Instant expiresAt;

    public ConversationSession(String id) {
        this.id = id;
        this.createdAt = Instant.now();
        this.conversationHistory = new ArrayList<>();
        this.stage = "GREETING";
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public void addMessage(String role, String content) {
        this.conversationHistory.add(Map.of("role", role, "content", content));
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<Map<String, String>> getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(List<Map<String, String>> conversationHistory) { this.conversationHistory = conversationHistory; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
