package com.kernel.core.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kernel.core.dto.ai.AiAnalysisResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AiAnalysisResultTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void deserializeValidReadyJson() throws Exception {
        String json = """
            {
                "readyToSubmit": true,
                "category": "TECHNICAL",
                "urgency": "HIGH",
                "summary": "Road broken",
                "followUpQuestion": null
            }
            """;

        AiAnalysisResult result = mapper.readValue(json, AiAnalysisResult.class);

        assertTrue(result.isReadyToSubmit());
        assertEquals("TECHNICAL", result.getCategory());
        assertEquals("HIGH", result.getUrgency());
        assertEquals("Road broken", result.getSummary());
        assertNull(result.getFollowUpQuestion());
    }

    @Test
    void deserializeNotReadyJson() throws Exception {
        String json = """
            {
                "readyToSubmit": false,
                "category": null,
                "urgency": null,
                "summary": null,
                "followUpQuestion": "Can you provide more details?"
            }
            """;

        AiAnalysisResult result = mapper.readValue(json, AiAnalysisResult.class);

        assertFalse(result.isReadyToSubmit());
        assertNull(result.getCategory());
        assertNull(result.getUrgency());
        assertNull(result.getSummary());
        assertEquals("Can you provide more details?", result.getFollowUpQuestion());
    }

    @Test
    void deserializeWithUnknownFields() throws Exception {
        String json = """
            {
                "readyToSubmit": false,
                "followUpQuestion": "Detail?",
                "unknownField123": "ignore me",
                "anotherUnknown": 42
            }
            """;

        AiAnalysisResult result = mapper.readValue(json, AiAnalysisResult.class);

        assertFalse(result.isReadyToSubmit());
        assertEquals("Detail?", result.getFollowUpQuestion());
    }

    @Test
    void verifyNullsWhenNotReady() throws Exception {
        String json = """
            {
                "readyToSubmit": false,
                "followUpQuestion": "Tell me more"
            }
            """;

        AiAnalysisResult result = mapper.readValue(json, AiAnalysisResult.class);

        assertNull(result.getCategory());
        assertNull(result.getUrgency());
        assertNull(result.getSummary());
    }
}
