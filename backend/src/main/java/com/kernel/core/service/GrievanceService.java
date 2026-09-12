package com.kernel.core.service;

import com.kernel.core.dto.request.GrievanceSubmitRequest;
import com.kernel.core.dto.response.GrievanceSubmitResponse;
import com.kernel.core.dto.response.CommunicationEnableResponse;
import com.kernel.core.dto.ai.AiAnalysisResult;
import com.kernel.core.model.Grievance;
import com.kernel.core.model.enums.GrievanceStatus;
import com.kernel.core.model.enums.CommunicationStatus;
import com.kernel.core.model.enums.Category;
import com.kernel.core.model.enums.Urgency;
import com.kernel.core.repository.GrievanceRepository;
import com.kernel.core.exception.ResourceNotFoundException;
import com.kernel.core.service.session.CommunicationSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class GrievanceService {
    private static final Logger log = LoggerFactory.getLogger(GrievanceService.class);

    private final GrievanceRepository grievanceRepository;
    private final EmailService emailService;
    private final AiService aiService;
    private final CommunicationSessionService communicationSessionService;

    public GrievanceService(GrievanceRepository grievanceRepository,
                            EmailService emailService,
                            AiService aiService,
                            CommunicationSessionService communicationSessionService) {
        this.grievanceRepository = grievanceRepository;
        this.emailService = emailService;
        this.aiService = aiService;
        this.communicationSessionService = communicationSessionService;
    }

    public GrievanceSubmitResponse createGrievance(GrievanceSubmitRequest request) {
        Grievance grievance = new Grievance();
        grievance.setName(request.getName().trim());
        grievance.setAge(request.getAge());
        grievance.setLocation(request.getLocation().trim());
        grievance.setEmail(request.getEmail().trim().toLowerCase());
        grievance.setLanguage(request.getLanguage().trim().toLowerCase());
        grievance.setOriginalGrievance(request.getGrievance());

        // Server owns these fields — never trust the client
        grievance.setStatus(GrievanceStatus.NEW);
        grievance.setCreatedAt(Instant.now());
        grievance.setUpdatedAt(Instant.now());
        grievance.setCommunicationStatus(CommunicationStatus.DISABLED);

        // AI analysis for classification and summary
        try {
            AiAnalysisResult analysis = aiService.analyzeGrievance(
                    request.getGrievance(), request.getLanguage());
            if (analysis != null) {
                grievance.setCategory(parseCategory(analysis.getCategory()));
                grievance.setUrgency(parseUrgency(analysis.getUrgency()));
                grievance.setAiSummary(analysis.getSummary());
            } else {
                grievance.setCategory(Category.OTHER);
                grievance.setUrgency(Urgency.LOW);
            }
        } catch (Exception e) {
            log.warn("AI analysis failed for grievance, using defaults. Error: {}", e.getMessage());
            grievance.setCategory(Category.OTHER);
            grievance.setUrgency(Urgency.LOW);
        }

        Grievance saved = grievanceRepository.save(grievance);

        // Send confirmation email — never lose the grievance if email fails
        try {
            emailService.sendGrievanceConfirmation(saved);
        } catch (Exception e) {
            log.error("Failed to send confirmation email for grievance ID: {}", saved.getId());
        }

        log.info("Created new grievance with ID: {}", saved.getId());

        GrievanceSubmitResponse response = new GrievanceSubmitResponse();
        response.setId(saved.getId());
        response.setStatus(saved.getStatus().name());
        response.setMessage("Your grievance has been submitted successfully. KERNEL is on it!");
        response.setCreatedAt(saved.getCreatedAt());
        return response;
    }

    public Page<Grievance> findAll(Pageable pageable) {
        return grievanceRepository.findAll(pageable);
    }

    public Grievance findById(String id) {
        return grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with ID: " + id));
    }

    public Grievance updateStatus(String id, GrievanceStatus status) {
        Grievance grievance = findById(id);
        grievance.setStatus(status);
        grievance.setUpdatedAt(Instant.now());
        return grievanceRepository.save(grievance);
    }

    public CommunicationEnableResponse enableCommunication(String id, String backendUrl) {
        Grievance grievance = findById(id);
        if (grievance.getCommunicationStatus() != CommunicationStatus.DISABLED
                && grievance.getCommunicationStatus() != CommunicationStatus.CLOSED
                && grievance.getCommunicationStatus() != null) {
            throw new IllegalStateException("Communication is already active for this grievance");
        }

        CommunicationSession session = communicationSessionService.createSession(id);

        grievance.setCommunicationStatus(CommunicationStatus.ACTIVE);
        grievance.setCommunicationToken(session.getVisitorToken());
        grievance.setCommunicationEnabledAt(Instant.now());
        grievance.setUpdatedAt(Instant.now());
        grievanceRepository.save(grievance);

        String visitorLink = backendUrl + "/communicate?token=" + session.getVisitorToken();

        try {
            emailService.sendCommunicationInvite(grievance, visitorLink);
        } catch (Exception e) {
            log.error("Failed to send communication invite email for grievance ID: {}", grievance.getId());
        }

        CommunicationEnableResponse response = new CommunicationEnableResponse();
        response.setVisitorToken(session.getVisitorToken());
        response.setVisitorLink(visitorLink);
        response.setAdminToken(session.getAdminToken());
        response.setExpiresAt(session.getExpiresAt());
        return response;
    }

    public void closeCommunication(String id) {
        Grievance grievance = findById(id);
        if (grievance.getCommunicationToken() != null) {
            try {
                CommunicationSession session = communicationSessionService
                        .getSessionByToken(grievance.getCommunicationToken());
                communicationSessionService.closeSession(session.getSessionId());
            } catch (Exception e) {
                log.warn("Communication session already closed or expired for grievance ID: {}", id);
            }
        }

        grievance.setCommunicationStatus(CommunicationStatus.CLOSED);
        grievance.setCommunicationClosedAt(Instant.now());
        grievance.setCommunicationToken(null);
        grievance.setUpdatedAt(Instant.now());
        grievanceRepository.save(grievance);
    }

    public Page<Grievance> searchGrievances(String keyword, Pageable pageable) {
        return grievanceRepository.searchByKeyword(keyword, pageable);
    }

    public Page<Grievance> findByStatus(GrievanceStatus status, Pageable pageable) {
        return grievanceRepository.findByStatus(status, pageable);
    }

    public Page<Grievance> findByCategory(Category category, Pageable pageable) {
        return grievanceRepository.findByCategory(category, pageable);
    }

    public Page<Grievance> findByUrgency(Urgency urgency, Pageable pageable) {
        return grievanceRepository.findByUrgency(urgency, pageable);
    }

    private Category parseCategory(String category) {
        if (category == null) return Category.OTHER;
        try {
            return Category.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Category.OTHER;
        }
    }

    private Urgency parseUrgency(String urgency) {
        if (urgency == null) return Urgency.LOW;
        try {
            return Urgency.valueOf(urgency.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Urgency.LOW;
        }
    }
}
