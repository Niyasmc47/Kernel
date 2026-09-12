package com.kernel.core.service;

import com.kernel.core.dto.response.ConversationResponse;
import com.kernel.core.dto.ai.AiAnalysisResult;

public interface AiService {
    ConversationResponse chat(String sessionId, String message, String language);
    AiAnalysisResult analyzeGrievance(String grievance, String language);
}
