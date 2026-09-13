package com.kernel.core.model;

import com.kernel.core.model.enums.Category;
import com.kernel.core.model.enums.CommunicationStatus;
import com.kernel.core.model.enums.GrievanceStatus;
import com.kernel.core.model.enums.Urgency;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "grievances")
public class Grievance {
    @Id
    private String id;
    
    private String name;
    private Integer age;
    private String location;
    
    @Indexed
    private String email;
    
    private String language;
    
    @Indexed
    private Category category;
    
    @Indexed
    private Urgency urgency;
    
    private String originalGrievance;
    private String aiSummary;
    
    @Indexed
    private GrievanceStatus status;
    
    @CreatedDate
    @Indexed
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
    
    // Communication metadata ONLY - never message content
    private CommunicationStatus communicationStatus;
    private String communicationToken;
    private Instant communicationEnabledAt;
    private Instant communicationClosedAt;

    // Optional voice note audio recording (Base64)
    private String voiceNoteBase64;
    private String voiceNoteContentType;

    public Grievance() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Urgency getUrgency() {
        return urgency;
    }

    public void setUrgency(Urgency urgency) {
        this.urgency = urgency;
    }

    public String getOriginalGrievance() {
        return originalGrievance;
    }

    public void setOriginalGrievance(String originalGrievance) {
        this.originalGrievance = originalGrievance;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public GrievanceStatus getStatus() {
        return status;
    }

    public void setStatus(GrievanceStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public CommunicationStatus getCommunicationStatus() {
        return communicationStatus;
    }

    public void setCommunicationStatus(CommunicationStatus communicationStatus) {
        this.communicationStatus = communicationStatus;
    }

    public String getCommunicationToken() {
        return communicationToken;
    }

    public void setCommunicationToken(String communicationToken) {
        this.communicationToken = communicationToken;
    }

    public Instant getCommunicationEnabledAt() {
        return communicationEnabledAt;
    }

    public void setCommunicationEnabledAt(Instant communicationEnabledAt) {
        this.communicationEnabledAt = communicationEnabledAt;
    }

    public Instant getCommunicationClosedAt() {
        return communicationClosedAt;
    }

    public void setCommunicationClosedAt(Instant communicationClosedAt) {
        this.communicationClosedAt = communicationClosedAt;
    }

    public String getVoiceNoteBase64() {
        return voiceNoteBase64;
    }

    public void setVoiceNoteBase64(String voiceNoteBase64) {
        this.voiceNoteBase64 = voiceNoteBase64;
    }

    public String getVoiceNoteContentType() {
        return voiceNoteContentType;
    }

    public void setVoiceNoteContentType(String voiceNoteContentType) {
        this.voiceNoteContentType = voiceNoteContentType;
    }
}
