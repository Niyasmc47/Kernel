package com.kernel.core.dto.response;

import com.kernel.core.dto.ai.AiAnalysisResult;

public class ConversationResponse {
    private String sessionId;
    private String message;
    private boolean readyToSubmit;
    private AiAnalysisResult analysisResult;

    public ConversationResponse() {}

    public ConversationResponse(String sessionId, String message, boolean readyToSubmit, AiAnalysisResult analysisResult) {
        this.sessionId = sessionId;
        this.message = message;
        this.readyToSubmit = readyToSubmit;
        this.analysisResult = analysisResult;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isReadyToSubmit() { return readyToSubmit; }
    public void setReadyToSubmit(boolean readyToSubmit) { this.readyToSubmit = readyToSubmit; }
    public AiAnalysisResult getAnalysisResult() { return analysisResult; }
    public void setAnalysisResult(AiAnalysisResult analysisResult) { this.analysisResult = analysisResult; }
}
