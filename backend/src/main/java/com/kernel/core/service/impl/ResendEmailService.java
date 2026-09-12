package com.kernel.core.service.impl;

import com.kernel.core.model.Grievance;
import com.kernel.core.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResendEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);

    private final RestTemplate restTemplate;

    @Value("${kernel.resend.api-key}")
    private String apiKey;

    @Value("${kernel.resend.from-email}")
    private String fromEmail;

    public ResendEmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public void sendGrievanceConfirmation(Grievance grievance) {
        try {
            String htmlContent = String.format("""
                <html>
                    <body>
                        <h2>Hello %s,</h2>
                        <p>We have received your grievance submission.</p>
                        <p>Details:</p>
                        <ul>
                            <li>Name: %s</li>
                            <li>Status: %s</li>
                            <li>Category: %s</li>
                        </ul>
                        <p>We will review it and get back to you shortly.</p>
                        <p>Best regards,<br/>KERNEL</p>
                    </body>
                </html>
                """, 
                grievance.getName() != null ? grievance.getName() : "Visitor",
                grievance.getName() != null ? grievance.getName() : "N/A",
                grievance.getStatus(),
                grievance.getCategory() != null ? grievance.getCategory() : "N/A"
            );

            sendEmail(grievance.getEmail(), "KERNEL - Grievance Received", htmlContent);
        } catch (Exception e) {
            log.error("Failed to send grievance confirmation email");
        }
    }

    @Override
    public void sendCommunicationInvite(Grievance grievance, String visitorLink) {
        try {
            String htmlContent = String.format("""
                <html>
                    <body>
                        <h2>Hello %s,</h2>
                        <p>KERNEL has opened a secure communication channel for your grievance.</p>
                        <p>You can access it using the following private, time-limited link:</p>
                        <p><a href="%s">%s</a></p>
                        <p>Please do not share this link.</p>
                        <p>Best regards,<br/>KERNEL</p>
                    </body>
                </html>
                """,
                grievance.getName() != null ? grievance.getName() : "Visitor",
                visitorLink, visitorLink
            );

            sendEmail(grievance.getEmail(), "KERNEL - Secure Communication Channel Opened", htmlContent);
        } catch (Exception e) {
            log.error("Failed to send communication invite email");
        }
    }

    private void sendEmail(String to, String subject, String html) {
        if (to == null || to.isBlank()) return;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("from", fromEmail);
        requestBody.put("to", List.of(to));
        requestBody.put("subject", subject);
        requestBody.put("html", html);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        restTemplate.postForEntity("https://api.resend.com/emails", request, String.class);
        log.info("Email sent successfully");
    }
}
