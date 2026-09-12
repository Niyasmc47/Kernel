package com.kernel.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiAnalysisResult {
    private boolean readyToSubmit;
    private String category;
    private String urgency;
    private String summary;
    private String followUpQuestion;

    public AiAnalysisResult() {}

    public AiAnalysisResult(boolean readyToSubmit, String category, String urgency, String summary, String followUpQuestion) {
        this.readyToSubmit = readyToSubmit;
        this.category = category;
        this.urgency = urgency;
        this.summary = summary;
        this.followUpQuestion = followUpQuestion;
    }

    public boolean isReadyToSubmit() { return readyToSubmit; }
    public void setReadyToSubmit(boolean readyToSubmit) { this.readyToSubmit = readyToSubmit; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getFollowUpQuestion() { return followUpQuestion; }
    public void setFollowUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; }
}
