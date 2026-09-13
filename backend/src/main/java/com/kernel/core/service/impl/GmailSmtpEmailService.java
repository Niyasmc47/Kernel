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
            ? "<li style='margin-bottom: 8px; color: #38bdf8;'>🎙️ <strong style='color: #7dd3fc;'>Voice Recording:</strong> Attached for playback</li>" 
            : "";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070a0f; color: #f8fafc; padding: 24px; margin: 0;">
                <div style="background-color: #0d131f; border: 1px solid #10b981; border-radius: 14px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid #10b981; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; padding: 5px 12px; border-radius: 20px; margin-bottom: 18px;">
                        KERNEL // MESSAGE TRANSMISSION LOGGED
                    </div>
                    <h2 style="color: #ffffff; margin: 0 0 12px 0; font-size: 22px;">Hello %s,</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0; margin-bottom: 16px;">
                        Theo has received your submission. Your details have been securely recorded onto the private communication relay.
                    </p>
                    <div style="background-color: #161f30; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 18px; margin: 20px 0;">
                        <ul style="margin: 0; padding-left: 18px; color: #f1f5f9; font-size: 13px; line-height: 1.8;">
                            <li style="margin-bottom: 6px;"><strong style="color: #94a3b8;">Contact:</strong> <span style="color: #ffffff;">%s</span></li>
                            <li style="margin-bottom: 6px;"><strong style="color: #94a3b8;">Location:</strong> <span style="color: #ffffff;">%s</span></li>
                            <li style="margin-bottom: 6px;"><strong style="color: #94a3b8;">Category:</strong> <span style="color: #34d399;">%s</span></li>
                            <li style="margin-bottom: 6px;"><strong style="color: #94a3b8;">Status:</strong> <span style="color: #38bdf8; font-weight: bold;">%s</span></li>
                            %s
                        </ul>
                    </div>
                    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                        Theo reviews incoming signals carefully. If your situation requires direct intervention or a secure line, you will receive a direct access link to this email address.
                    </p>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 16px; line-height: 1.5;">
                        Sent from KERNEL Central Relay &bull; Detroit, MI<br/>
                        <em style="color: #64748b;">"Fix what is broken. Honor the fracture."</em>
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
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070a0f; color: #f8fafc; padding: 20px; margin: 0;">
                    <div style="background-color: #0d131f; border: 1px solid #10b981; border-radius: 14px; padding: 26px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                        <h2 style="color: #34d399; margin: 0 0 16px 0; font-size: 20px; font-weight: bold;">🚨 KERNEL ALERT: New Citizen Transmission</h2>
                        <p style="color: #f8fafc; font-size: 14px; margin: 8px 0; line-height: 1.5;">
                            <strong style="color: #94a3b8;">Citizen:</strong> <span style="color: #ffffff; font-weight: bold;">%s</span> (Age: <span style="color: #ffffff;">%s</span>)
                        </p>
                        <p style="color: #f8fafc; font-size: 14px; margin: 8px 0; line-height: 1.5;">
                            <strong style="color: #94a3b8;">Email:</strong> <a href="mailto:%s" style="color: #38bdf8; text-decoration: underline;">%s</a> &nbsp;|&nbsp; <strong style="color: #94a3b8;">Location:</strong> <span style="color: #ffffff;">%s</span>
                        </p>
                        <p style="color: #f8fafc; font-size: 14px; margin: 8px 0; line-height: 1.5;">
                            <strong style="color: #94a3b8;">Category:</strong> <span style="color: #34d399;">%s</span> &nbsp;|&nbsp; <strong style="color: #94a3b8;">Urgency:</strong> <span style="color: #f59e0b; font-weight: bold;">%s</span>
                        </p>
                        <div style="background-color: #161f30; border-left: 4px solid #10b981; border-radius: 6px; padding: 14px; margin: 18px 0; color: #f8fafc; font-size: 14px; line-height: 1.6;">
                            <strong style="color: #34d399; display: block; margin-bottom: 4px;">Summary / Grievance:</strong>
                            <span style="color: #f1f5f9;">%s</span>
                        </div>
                        %s
                    </div>
                </body>
                </html>
                """,
                recipientName,
                grievance.getAge() != null ? grievance.getAge() : "N/A",
                grievance.getEmail(),
                grievance.getEmail(),
                grievance.getLocation() != null ? grievance.getLocation() : "Unknown",
                grievance.getCategory() != null ? grievance.getCategory() : "General",
                grievance.getUrgency() != null ? grievance.getUrgency() : "LOW",
                grievance.getAiSummary() != null ? grievance.getAiSummary() : grievance.getOriginalGrievance(),
                hasVoiceNote ? "<div style='background-color: rgba(56,189,248,0.15); border: 1px solid #38bdf8; border-radius: 8px; padding: 12px; margin-top: 14px; color: #38bdf8; font-size: 13px;'>🎙️ <strong>Citizen Voice Note: Attached to this email for playback.</strong></div>" : ""
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
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070a0f; color: #f8fafc; padding: 24px; margin: 0;">
                <div style="background-color: #0d131f; border: 1px solid #10b981; border-radius: 14px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #34d399; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; padding: 5px 12px; border-radius: 20px; margin-bottom: 18px;">
                        SECURE 1-ON-1 COMMUNICATION CHANNEL
                    </div>
                    <h2 style="color: #ffffff; margin: 0 0 12px 0; font-size: 22px;">Hello %s,</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0; margin-bottom: 16px;">
                        Theo has opened a direct, private communication channel regarding your message.
                    </p>
                    <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 18px;">
                        Click the button below to enter the secure room:
                    </p>
                    <div style="text-align: center; margin: 24px 0;">
                        <a href="%s" style="display: inline-block; background-color: #10b981; color: #040806; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; letter-spacing: 0.05em; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
                            JOIN PRIVATE CHANNEL &rarr;
                        </a>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">Or paste this link into your browser:</p>
                    <div style="word-break: break-all; font-size: 12px; color: #38bdf8; background-color: #161f30; border: 1px solid rgba(56, 189, 248, 0.3); padding: 12px; border-radius: 8px;">
                        %s
                    </div>
                    <p style="margin-top: 18px; font-size: 12px; color: #f59e0b; line-height: 1.5;">
                        &bull; This link is private to you and expires after the session concludes. Please do not forward it.
                    </p>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 16px;">
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

