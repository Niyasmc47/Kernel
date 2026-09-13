package com.kernel.core.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

@Controller
public class CommunicateRedirectController {

    private final String frontendUrl;

    public CommunicateRedirectController(
            @Value("${kernel.frontend.url:${FRONTEND_URL:http://localhost:3000}}") String frontendUrl) {
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @GetMapping("/communicate")
    public RedirectView redirectCommunicate(
            @RequestParam(value = "token", required = false) String token,
            @RequestParam(value = "grievanceId", required = false) String grievanceId) {
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/communicate");
        if (token != null && !token.isBlank()) {
            builder.queryParam("token", token);
        }
        if (grievanceId != null && !grievanceId.isBlank()) {
            builder.queryParam("grievanceId", grievanceId);
        }

        return new RedirectView(builder.build().toUriString());
    }
}

