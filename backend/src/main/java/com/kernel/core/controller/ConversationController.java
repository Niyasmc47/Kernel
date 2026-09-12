package com.kernel.core.controller;

import com.kernel.core.dto.request.ConversationMessageRequest;
import com.kernel.core.dto.request.ConversationStartRequest;
import com.kernel.core.dto.response.ConversationResponse;
import com.kernel.core.service.AiService;
import com.kernel.core.service.ConversationSessionService;
import com.kernel.core.service.session.ConversationSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationSessionService conversationSessionService;
    private final AiService aiService;

    public ConversationController(ConversationSessionService conversationSessionService, AiService aiService) {
        this.conversationSessionService = conversationSessionService;
        this.aiService = aiService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConversationResponse startConversation(@RequestBody @Valid ConversationStartRequest request) {
        ConversationSession session = conversationSessionService.createSession(request.getLanguage());
        return new ConversationResponse(session.getId(), "Session started", false, null);
    }

    @PostMapping("/{sessionId}/messages")
    public ConversationResponse sendMessage(@PathVariable String sessionId, @RequestBody @Valid ConversationMessageRequest request) {
        ConversationSession session = conversationSessionService.getSession(sessionId);
        return aiService.chat(sessionId, request.getMessage(), session.getLanguage());
    }

    @GetMapping("/{sessionId}")
    public ConversationResponse getSession(@PathVariable String sessionId) {
        ConversationSession session = conversationSessionService.getSession(sessionId);
        return new ConversationResponse(session.getId(), null, false, null);
    }
}
