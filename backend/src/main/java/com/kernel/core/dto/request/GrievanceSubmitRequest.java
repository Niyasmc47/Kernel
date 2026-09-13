package com.kernel.core.dto.request;

import jakarta.validation.constraints.*;

public class GrievanceSubmitRequest {
    @NotBlank
    private String sessionId;
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;
    @NotNull
    @Min(1)
    @Max(150)
    private Integer age;
    @NotBlank
    @Size(max = 200)
    private String location;
    @NotBlank
    @Email
    @Size(max = 254)
    private String email;
    @NotBlank
    @Size(min = 2, max = 5)
    private String language;
    @NotBlank
    @Size(min = 10, max = 10000)
    private String grievance;

    private String voiceNoteBase64;
    private String voiceNoteContentType;

    public GrievanceSubmitRequest() {}

    public GrievanceSubmitRequest(String sessionId, String name, Integer age, String location, String email, String language, String grievance) {
        this.sessionId = sessionId;
        this.name = name;
        this.age = age;
        this.location = location;
        this.email = email;
        this.language = language;
        this.grievance = grievance;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
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
    public String getGrievance() { return grievance; }
    public void setGrievance(String grievance) { this.grievance = grievance; }
    public String getVoiceNoteBase64() { return voiceNoteBase64; }
    public void setVoiceNoteBase64(String voiceNoteBase64) { this.voiceNoteBase64 = voiceNoteBase64; }
    public String getVoiceNoteContentType() { return voiceNoteContentType; }
    public void setVoiceNoteContentType(String voiceNoteContentType) { this.voiceNoteContentType = voiceNoteContentType; }
}
