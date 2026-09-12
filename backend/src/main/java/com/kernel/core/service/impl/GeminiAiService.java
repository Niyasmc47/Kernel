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
public class GeminiAiService implements AiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ConversationSessionService conversationSessionService;

    @Value("${kernel.gemini.api-key:}")
    private String apiKey;

    @Value("${kernel.gemini.model:gemini-1.5-flash}")
    private String model;

    @Value("${kernel.gemini.base-url:https://generativelanguage.googleapis.com/v1beta/models}")
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

    public GeminiAiService(RestTemplate restTemplate, ObjectMapper objectMapper, ConversationSessionService conversationSessionService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.conversationSessionService = conversationSessionService;
    }

    @Override
    public ConversationResponse chat(String sessionId, String message, String language) {
        ConversationSession session = conversationSessionService.getSession(sessionId);
        session.addMessage("user", message);

        String prompt = SYSTEM_PROMPT.replace("{language}", language);
        Map<String, Object> requestBody = buildGeminiRequest(prompt, session.getConversationHistory());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // API key is passed in query param, not Bearer

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        String cleanApiKey = apiKey != null ? apiKey.replace("\"", "").replace("'", "").trim() : "";
        String cleanModel = model != null ? model.replace("models/", "").split("#")[0].split(" ")[0].trim() : "";
        String cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        if (!cleanBaseUrl.endsWith("/models")) {
            cleanBaseUrl += "/models";
        }
        String url = cleanBaseUrl + "/" + cleanModel + ":generateContent?key=" + cleanApiKey;
        log.info("Gemini Endpoint: {}", url.split("\\?")[0]); // Log without API key

        try {
            Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
            String content = extractContentFromGeminiResponse(response);

            AiAnalysisResult analysisResult;
            try {
                if (content != null && content.contains("```json")) {
                    content = content.replace("```json", "").replace("```", "").trim();
                }
                analysisResult = objectMapper.readValue(content, AiAnalysisResult.class);
            } catch (Exception parseEx) {
                log.error("Failed to parse Gemini JSON: " + content, parseEx);
                throw parseEx;
            }
            
            session.addMessage("assistant", content);

            ConversationResponse convResponse = new ConversationResponse();
            convResponse.setSessionId(sessionId);
            convResponse.setMessage(analysisResult.getFollowUpQuestion());
            convResponse.setReadyToSubmit(analysisResult.isReadyToSubmit());
            
            if (analysisResult.isReadyToSubmit()) {
                convResponse.setAnalysisResult(analysisResult);
            }
            return convResponse;
        } catch (org.springframework.web.client.HttpStatusCodeException httpEx) {
            log.error("Gemini HTTP Error: {} - {}", httpEx.getStatusCode(), httpEx.getResponseBodyAsString(), httpEx);
            throw new RuntimeException("KERNEL is temporarily unable to connect to the AI service.", httpEx);
        } catch (Exception e) {
            log.error("Failed to communicate with Gemini", e);
            throw new RuntimeException("KERNEL is temporarily unable to connect to the AI service.", e);
        }
    }

    @Override
    public AiAnalysisResult analyzeGrievance(String grievance, String language) {
        String prompt = "Analyze the following grievance and output valid JSON with keys: category, urgency, summary, followUpQuestion (empty), readyToSubmit (true). Grievance: " + grievance;
        
        List<Map<String, String>> history = new ArrayList<>();
        history.add(Map.of("role", "user", "content", prompt));
        
        Map<String, Object> requestBody = buildGeminiRequest(null, history);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        String cleanApiKey = apiKey != null ? apiKey.replace("\"", "").replace("'", "").trim() : "";
        String cleanModel = model != null ? model.replace("models/", "").split("#")[0].split(" ")[0].trim() : "";
        String cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        if (!cleanBaseUrl.endsWith("/models")) {
            cleanBaseUrl += "/models";
        }
        String url = cleanBaseUrl + "/" + cleanModel + ":generateContent?key=" + cleanApiKey;

        try {
            Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
            String content = extractContentFromGeminiResponse(response);

            if (content != null && content.contains("```json")) {
                content = content.replace("```json", "").replace("```", "").trim();
            }

            return objectMapper.readValue(content, AiAnalysisResult.class);
        } catch (org.springframework.web.client.HttpStatusCodeException httpEx) {
            log.error("Gemini HTTP Error in analysis: {} - {}", httpEx.getStatusCode(), httpEx.getResponseBodyAsString(), httpEx);
        } catch (Exception e) {
            log.error("Failed to communicate with Gemini for analysis", e);
        }
        
        AiAnalysisResult fallback = new AiAnalysisResult();
        fallback.setReadyToSubmit(true);
        fallback.setCategory("OTHER");
        fallback.setUrgency("LOW");
        fallback.setSummary(grievance != null && grievance.length() > 50 ? grievance.substring(0, 50) + "..." : grievance);
        return fallback;
    }
    
    private Map<String, Object> buildGeminiRequest(String systemPrompt, List<Map<String, String>> conversationHistory) {
        Map<String, Object> requestBody = new HashMap<>();
        
        if (systemPrompt != null) {
            requestBody.put("system_instruction", Map.of(
                "parts", List.of(Map.of("text", systemPrompt))
            ));
        }

        List<Map<String, Object>> contents = new ArrayList<>();
        for (Map<String, String> msg : conversationHistory) {
            String role = msg.get("role").equals("user") ? "user" : "model";
            contents.add(Map.of(
                "role", role,
                "parts", List.of(Map.of("text", msg.get("content")))
            ));
        }
        requestBody.put("contents", contents);
        
        requestBody.put("generationConfig", Map.of(
            "responseMimeType", "application/json"
        ));
        
        return requestBody;
    }

    private String extractContentFromGeminiResponse(Map<?, ?> response) {
        if (response == null || !response.containsKey("candidates")) {
            throw new RuntimeException("Invalid Gemini response: missing candidates");
        }
        
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates.isEmpty()) {
            throw new RuntimeException("Invalid Gemini response: empty candidates");
        }
        
        Map<String, Object> contentObj = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
        
        return (String) parts.get(0).get("text");
    }
}

