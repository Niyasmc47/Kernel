package com.kernel.core.service.impl;

import com.kernel.core.model.Grievance;
import com.kernel.core.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
@Primary
public class GmailSmtpEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(GmailSmtpEmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:niyas36et@gmail.com}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String appPassword;

    public GmailSmtpEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean isConfigured() {
        return appPassword != null && !appPassword.trim().isEmpty();
    }

    @Override
    public void sendGrievanceConfirmation(Grievance grievance) {
        if (!isConfigured()) {
            log.warn("Google SMTP is not configured. Please ensure GMAIL_APP_PASSWORD is set in environment.");
            return;
        }

        if (grievance.getEmail() == null || grievance.getEmail().isBlank()) {
            return;
        }

        String recipientName = grievance.getName() != null ? grievance.getName() : "Citizen";
        boolean hasVoiceNote = grievance.getVoiceNoteBase64() != null && !grievance.getVoiceNoteBase64().isBlank();

        String voiceNoteStatusHtml = hasVoiceNote 
            ? "<li><strong>Voice Recording:</strong> Attached (Playable audio file)</li>" 
            : "";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070a0f; color: #e2e8f0; padding: 24px; }
                    .card { background: #0c1017; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
                    h2 { color: #ffffff; margin-top: 0; font-size: 22px; }
                    p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
                    .details { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; margin: 20px 0; }
                    .details li { font-size: 13px; color: #cbd5e1; margin-bottom: 6px; list-style: none; }
                    .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="badge">KERNEL // MESSAGE TRANSMISSION LOGGED</div>
                    <h2>Hello %s,</h2>
                    <p>Theo has received your submission. Your details have been securely recorded onto the private communication relay.</p>
                    <div class="details">
                        <li><strong>Contact:</strong> %s</li>
                        <li><strong>Location:</strong> %s</li>
                        <li><strong>Category:</strong> %s</li>
                        <li><strong>Status:</strong> %s</li>
                        %s
                    </div>
                    <p>Theo reviews incoming signals carefully. If your situation requires direct intervention or a secure line, you will receive another link directly to this email address.</p>
                    <div class="footer">
                        Sent from KERNEL Central Relay &bull; Detroit, MI<br/>
                        <em>"Fix what is broken. Honor the fracture."</em>
                    </div>
                </div>
            </body>
            </html>
            """,
            recipientName,
            grievance.getEmail(),
            grievance.getLocation() != null ? grievance.getLocation() : "Unknown",
            grievance.getCategory() != null ? grievance.getCategory() : "General",
            grievance.getStatus(),
            voiceNoteStatusHtml
        );

        // 1. Send confirmation to citizen (with voice attachment if present)
        sendHtmlEmailWithVoiceNote(
            grievance.getEmail(), 
            "KERNEL - Message Received from " + recipientName, 
            htmlContent, 
            grievance.getVoiceNoteBase64(), 
            grievance.getVoiceNoteContentType()
        );

        // 2. If voice note or urgent grievance, notify superhero mailbox with direct attachment
        if (fromEmail != null && !fromEmail.equalsIgnoreCase(grievance.getEmail())) {
            String adminNotificationHtml = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070a0f; color: #e2e8f0; padding: 20px; }
                        .card { background: #0c1017; border: 1px solid #10b981; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; }
                        h2 { color: #34d399; margin-top: 0; }
                        .summary { background: rgba(16,185,129,0.1); border-left: 3px solid #10b981; padding: 12px; margin: 16px 0; font-style: italic; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>🚨 KERNEL ALERT: New Citizen Transmission</h2>
                        <p><strong>Citizen:</strong> %s (Age: %s)</p>
                        <p><strong>Email:</strong> %s | <strong>Location:</strong> %s</p>
                        <p><strong>Category:</strong> %s | <strong>Urgency:</strong> %s</p>
                        <div class="summary">
                            <strong>Summary:</strong> %s
                        </div>
                        %s
                    </div>
                </body>
                </html>
                """,
                recipientName,
                grievance.getAge() != null ? grievance.getAge() : "N/A",
                grievance.getEmail(),
                grievance.getLocation() != null ? grievance.getLocation() : "Unknown",
                grievance.getCategory() != null ? grievance.getCategory() : "General",
                grievance.getUrgency() != null ? grievance.getUrgency() : "LOW",
                grievance.getAiSummary() != null ? grievance.getAiSummary() : grievance.getOriginalGrievance(),
                hasVoiceNote ? "<p style='color:#38bdf8;'>🎙️ <strong>Citizen Voice Note: Attached to this email for playback.</strong></p>" : ""
            );

            try {
                sendHtmlEmailWithVoiceNote(
                    fromEmail,
                    "🚨 [KERNEL ALERT] New " + (hasVoiceNote ? "Voice Transmission" : "Grievance") + " from " + recipientName,
                    adminNotificationHtml,
                    grievance.getVoiceNoteBase64(),
                    grievance.getVoiceNoteContentType()
                );
            } catch (Exception e) {
                log.warn("Failed to dispatch admin superhero email alert: {}", e.getMessage());
            }
        }
    }

    @Override
    public void sendCommunicationInvite(Grievance grievance, String visitorLink) {
        if (!isConfigured()) {
            log.warn("Google SMTP is not configured. Please ensure GMAIL_APP_PASSWORD is set in environment.");
            return;
        }

        if (grievance.getEmail() == null || grievance.getEmail().isBlank()) {
            return;
        }

        String recipientName = grievance.getName() != null ? grievance.getName() : "Citizen";
        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070a0f; color: #e2e8f0; padding: 24px; }
                    .card { background: #0c1017; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 16px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
                    h2 { color: #ffffff; margin-top: 0; }
                    p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
                    .btn { display: inline-block; background: #10b981; color: #040806; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 18px 0; font-size: 14px; letter-spacing: 0.05em; }
                    .link-box { word-break: break-all; font-size: 12px; color: #38bdf8; background: rgba(56, 189, 248, 0.08); padding: 10px; border-radius: 6px; }
                    .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="badge">SECURE 1-ON-1 COMMUNICATION CHANNEL</div>
                    <h2>Hello %s,</h2>
                    <p>Theo has opened a direct, private communication channel regarding your message.</p>
                    <p>Click the button below to enter the secure room:</p>
                    <a href="%s" class="btn">JOIN PRIVATE CHANNEL &rarr;</a>
                    <p>Or paste this link into your browser:</p>
                    <div class="link-box">%s</div>
                    <p style="margin-top: 18px; font-size: 12px; color: #f59e0b;">
                        &bull; This link is private to you and expires after the session concludes. Please do not forward it.
                    </p>
                    <div class="footer">
                        KERNEL Secure Communications &bull; End-to-End Relay
                    </div>
                </div>
            </body>
            </html>
            """,
            recipientName,
            visitorLink,
            visitorLink
        );

        sendHtmlEmailWithVoiceNote(grievance.getEmail(), "KERNEL - Secure 1-on-1 Communication Link for " + recipientName, htmlContent, null, null);
    }

    private void sendHtmlEmailWithVoiceNote(String to, String subject, String htmlBody, String voiceNoteBase64, String contentType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "KERNEL Central Relay");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            // If voice note audio exists, decode and attach
            if (voiceNoteBase64 != null && !voiceNoteBase64.isBlank()) {
                try {
                    String cleanBase64 = voiceNoteBase64;
                    if (cleanBase64.contains(",")) {
                        cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                    }
                    byte[] audioBytes = Base64.getDecoder().decode(cleanBase64);
                    String mimeType = contentType != null && !contentType.isBlank() ? contentType : "audio/webm";
                    String filename = mimeType.contains("wav") ? "citizen_voice_transmission.wav" : "citizen_voice_transmission.webm";
                    
                    helper.addAttachment(filename, new ByteArrayResource(audioBytes), mimeType);
                    log.info("Attached voice recording ({} bytes, mime: {}) to email to: {}", audioBytes.length, mimeType, to);
                } catch (Exception attachErr) {
                    log.error("Failed to attach voice note audio to email: {}", attachErr.getMessage());
                }
            }

            mailSender.send(message);
            log.info("Successfully sent email via Google SMTP ({}) to: {}", fromEmail, to);
        } catch (Exception e) {
            log.error("Failed to send email via Google SMTP to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Gmail SMTP sending failed: " + e.getMessage(), e);
        }
    }
}

