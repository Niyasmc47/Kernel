package com.kernel.core.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kernel.core.dto.ai.AiAnalysisResult;
import com.kernel.core.dto.response.ConversationResponse;
import com.kernel.core.service.AiService;
import com.kernel.core.service.ConversationSessionService;
import com.kernel.core.service.session.ConversationSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiService implements AiService {
    private static final Logger log = LoggerFactory.getLogger(OpenAiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ConversationSessionService conversationSessionService;

    @Value("${kernel.openai.api-key}")
    private String apiKey;

    @Value("${kernel.openai.model:gpt-4o}")
    private String model;

    @Value("${kernel.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    private static final String SYSTEM_PROMPT = """
            You are KERNEL, an interactive superhero who helps people with their problems. You are friendly, curious, intelligent, slightly sarcastic, and protective. You genuinely care about people and their issues.

            Your job is to have a natural conversation with the visitor to understand their problem or grievance. You should:
            1. Greet them warmly and ask what brings them to you
            2. Ask natural follow-up questions to understand their situation
            3. Be empathetic but also practical
            4. When you feel you have enough information, determine:
               - The category of their issue (GENERAL, PERSONAL, EMERGENCY, TECHNICAL, COMMUNITY, or OTHER)
               - The urgency (LOW, MEDIUM, HIGH, or CRITICAL)
               - A concise summary of their grievance

            IMPORTANT RULES:
            - Respond in the user's language: {language}
            - Be conversational, not robotic
            - Don't ask all questions at once
            - If the issue is an EMERGENCY or CRITICAL, expedite the process
            - When you have enough information, set readyToSubmit to true

            You MUST respond with valid JSON in this exact format:
            {
              "readyToSubmit": false,
              "category": null,
              "urgency": null,
              "summary": null,
              "followUpQuestion": "Your response/question to the user"
            }

            When ready to submit:
            {
              "readyToSubmit": true,
              "category": "CATEGORY_VALUE",
              "urgency": "URGENCY_VALUE",
              "summary": "Concise summary of the grievance",
              "followUpQuestion": "A message confirming you've understood their issue and it will be submitted"
            }
            """;

    public OpenAiService(RestTemplate restTemplate, ObjectMapper objectMapper, ConversationSessionService conversationSessionService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.conversationSessionService = conversationSessionService;
    }

    @Override
    public ConversationResponse chat(String sessionId, String message, String language) {
        ConversationSession session = conversationSessionService.getSession(sessionId);
        session.addMessage("user", message);

        String prompt = SYSTEM_PROMPT.replace("{language}", language);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", prompt));
        messages.addAll(session.getConversationHistory());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("response_format", Map.of("type", "json_object"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            String url = baseUrl + "/chat/completions";
            Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
            
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) messageObj.get("content");

            AiAnalysisResult analysisResult = objectMapper.readValue(content, AiAnalysisResult.class);
            
            session.addMessage("assistant", content);

            ConversationResponse convResponse = new ConversationResponse();
            convResponse.setSessionId(sessionId);
            convResponse.setMessage(analysisResult.getFollowUpQuestion());
            convResponse.setReadyToSubmit(analysisResult.isReadyToSubmit());
            
            if (analysisResult.isReadyToSubmit()) {
                convResponse.setAnalysisResult(analysisResult);
            }
            return convResponse;
        } catch (Exception e) {
            log.error("Failed to communicate with OpenAI");
            throw new RuntimeException("Failed to process conversation. Please try again.");
        }
    }

    @Override
    public AiAnalysisResult analyzeGrievance(String grievance, String language) {
        String prompt = "Analyze the following grievance and output valid JSON with keys: category, urgency, summary, followUpQuestion (empty), readyToSubmit (true). Grievance: " + grievance;
        
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "user", "content", prompt));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("response_format", Map.of("type", "json_object"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            String url = baseUrl + "/chat/completions";
            Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
            
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) messageObj.get("content");

            return objectMapper.readValue(content, AiAnalysisResult.class);
        } catch (Exception e) {
            log.error("Failed to communicate with OpenAI for analysis");
            AiAnalysisResult fallback = new AiAnalysisResult();
            fallback.setReadyToSubmit(true);
            fallback.setCategory("OTHER");
            fallback.setUrgency("LOW");
            fallback.setSummary(grievance != null && grievance.length() > 50 ? grievance.substring(0, 50) + "..." : grievance);
            return fallback;
        }
    }
}
