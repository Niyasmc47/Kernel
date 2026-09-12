package com.kernel.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ConversationStartRequest {
    @NotBlank(message = "Language is required")
    @Size(min = 2, max = 5, message = "Language code must be 2-5 characters")
    private String language;

    public ConversationStartRequest() {}
    public ConversationStartRequest(String language) { this.language = language; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
