package com.kernel.core.dto.websocket;

import java.time.Instant;

public class ChatMessage {
    public enum MessageType { JOIN, LEAVE, MESSAGE }
    public enum SenderRole { ADMIN, VISITOR }

    private MessageType type;
    private SenderRole sender;
    private String content;
    private Instant timestamp;

    public ChatMessage() {}
    public ChatMessage(MessageType type, SenderRole sender, String content) {
        this.type = type;
        this.sender = sender;
        this.content = content;
        this.timestamp = Instant.now();
    }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public SenderRole getSender() { return sender; }
    public void setSender(SenderRole sender) { this.sender = sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
