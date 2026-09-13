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

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class GrievanceService {
    private static final Logger log = LoggerFactory.getLogger(GrievanceService.class);

    private final GrievanceRepository grievanceRepository;
    private final EmailService emailService;
    private final AiService aiService;
    private final CommunicationSessionService communicationSessionService;
    private final Map<String, Grievance> inMemoryStore = new ConcurrentHashMap<>();

    public GrievanceService(GrievanceRepository grievanceRepository,
                            EmailService emailService,
                            AiService aiService,
                            CommunicationSessionService communicationSessionService) {
        this.grievanceRepository = grievanceRepository;
        this.emailService = emailService;
        this.aiService = aiService;
        this.communicationSessionService = communicationSessionService;
    }

    @PostConstruct
    public void initHistoricalRecords() {
        if (!inMemoryStore.isEmpty()) return;

        // Seed rich historical chronicle records
        createHistoricalCase(
            "grv-hist-001",
            "Marcus Vance",
            34,
            "East Detroit, MI",
            "m.vance@detroitworks.net",
            "en",
            Category.EMERGENCY,
            Urgency.HIGH,
            "Structural vibration stress on apartment block foundation after heavy transit line failure. Cracks expanding rapidly across basement support beams.",
            "Load-bearing fracture along East Detroit transit corridor; Theo deployed atomic resonance reforge to stabilize structural support columns.",
            GrievanceStatus.RESOLVED,
            Instant.now().minus(1, ChronoUnit.DAYS).minus(4, ChronoUnit.HOURS)
        );

        createHistoricalCase(
            "grv-hist-002",
            "Elena Rostova",
            28,
            "Chicago, IL",
            "e.rostova@research-lab.org",
            "en",
            Category.TECHNICAL,
            Urgency.CRITICAL,
            "Containment chamber overload in particle harmonics division. Magnetic deflection shield collapsed during high-voltage resonance test.",
            "Laboratory core power surge with intense electromagnetic discharge; Theo contained kinetic blast wave and prevented perimeter fallout.",
            GrievanceStatus.RESOLVED,
            Instant.now().minus(3, ChronoUnit.DAYS).minus(7, ChronoUnit.HOURS)
        );

        createHistoricalCase(
            "grv-hist-003",
            "Darius Cole",
            46,
            "Detroit, MI",
            "darius.cole@communityclinic.org",
            "en",
            Category.COMMUNITY,
            Urgency.MEDIUM,
            "Targeted power line cut at local neighborhood health center. Critical refrigeration units and life support backup circuits went dark.",
            "Deliberate power grid sabotage targeting neighborhood medical clinic; emergency power circuits reforged and restored in-memory.",
            GrievanceStatus.RESOLVED,
            Instant.now().minus(6, ChronoUnit.DAYS).minus(2, ChronoUnit.HOURS)
        );

        createHistoricalCase(
            "grv-hist-004",
            "Amina Sayed",
            22,
            "Cleveland, OH",
            "amina.sayed@univ-cleveland.edu",
            "en",
            Category.GENERAL,
            Urgency.LOW,
            "Corrupted electronic surveillance loop tracking student residences without authorization. Cameras refusing manual shutdown commands.",
            "Unauthorized automated optical tracking anomaly; signal bleed pulse discharged to scramble corrupted surveillance optics.",
            GrievanceStatus.REVIEWING,
            Instant.now().minus(10, ChronoUnit.DAYS)
        );

        createHistoricalCase(
            "grv-hist-005",
            "Citizen K",
            29,
            "East Detroit Workshop",
            "contact@lattice-relay.io",
            "en",
            Category.OTHER,
            Urgency.CRITICAL,
            "Unidentified red electromagnetic static bleed along sector 4 communication lines. Data packets being systematically consumed into a void.",
            "Root Access corruption cluster spreading along subterranean data cables; isolated and firewall containment active.",
            GrievanceStatus.NEW,
            Instant.now().minus(14, ChronoUnit.DAYS)
        );

        log.info("Initialized {} historical chronicle grievances in memory.", inMemoryStore.size());
    }

    private void createHistoricalCase(String id, String name, int age, String location, String email, String lang, Category category, Urgency urgency, String grievanceText, String summary, GrievanceStatus status, Instant createdAt) {
        Grievance g = new Grievance();
        g.setId(id);
        g.setName(name);
        g.setAge(age);
        g.setLocation(location);
        g.setEmail(email);
        g.setLanguage(lang);
        g.setCategory(category);
        g.setUrgency(urgency);
        g.setOriginalGrievance(grievanceText);
        g.setAiSummary(summary);
        g.setStatus(status);
        g.setCommunicationStatus(CommunicationStatus.DISABLED);
        g.setCreatedAt(createdAt);
        g.setUpdatedAt(createdAt);

        inMemoryStore.put(id, g);
    }

    public GrievanceSubmitResponse createGrievance(GrievanceSubmitRequest request) {
        Grievance grievance = new Grievance();
        grievance.setName(request.getName().trim());
        grievance.setAge(request.getAge());
        grievance.setLocation(request.getLocation().trim());
        grievance.setEmail(request.getEmail().trim().toLowerCase());
        grievance.setLanguage(request.getLanguage().trim().toLowerCase());
        grievance.setOriginalGrievance(request.getGrievance());
        grievance.setVoiceNoteBase64(request.getVoiceNoteBase64());
        grievance.setVoiceNoteContentType(request.getVoiceNoteContentType());

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

        Grievance saved = grievance;
        try {
            saved = grievanceRepository.save(grievance);
        } catch (Exception e) {
            log.warn("Database save failed ({}). Preserving grievance in memory fallback.", e.getMessage());
            if (saved.getId() == null) {
                saved.setId("grv-" + UUID.randomUUID().toString());
            }
        }

        inMemoryStore.put(saved.getId(), saved);

        // Send confirmation email — never lose the grievance if email fails
        try {
            emailService.sendGrievanceConfirmation(saved);
        } catch (Exception e) {
            log.error("Failed to send confirmation email for grievance ID: {}", saved.getId(), e);
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
        try {
            Page<Grievance> page = grievanceRepository.findAll(pageable);
            if (page.hasContent()) {
                page.forEach(g -> inMemoryStore.putIfAbsent(g.getId(), g));
                return page;
            }
        } catch (Exception e) {
            log.warn("Mongo findAll failed ({}). Falling back to in-memory store.", e.getMessage());
        }
        return getInMemoryPage(pageable, g -> true);
    }

    public Grievance findById(String id) {
        if (inMemoryStore.containsKey(id)) {
            return inMemoryStore.get(id);
        }
        try {
            return grievanceRepository.findById(id)
                    .map(g -> {
                        inMemoryStore.put(g.getId(), g);
                        return g;
                    })
                    .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with ID: " + id));
        } catch (ResourceNotFoundException rnfe) {
            throw rnfe;
        } catch (Exception e) {
            log.warn("Mongo findById failed: {}. Checking in-memory store.", e.getMessage());
            Grievance found = inMemoryStore.get(id);
            if (found != null) return found;
            throw new ResourceNotFoundException("Grievance not found with ID: " + id);
        }
    }

    public Grievance updateStatus(String id, GrievanceStatus status) {
        Grievance grievance = findById(id);
        grievance.setStatus(status);
        grievance.setUpdatedAt(Instant.now());
        inMemoryStore.put(id, grievance);
        try {
            return grievanceRepository.save(grievance);
        } catch (Exception e) {
            log.warn("Mongo save on status update failed: {}", e.getMessage());
            return grievance;
        }
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
        inMemoryStore.put(id, grievance);
        try {
            grievanceRepository.save(grievance);
        } catch (Exception e) {
            log.warn("Mongo save on enableCommunication failed: {}", e.getMessage());
        }

        String visitorLink = backendUrl + "/communicate?token=" + session.getVisitorToken();

        try {
            emailService.sendCommunicationInvite(grievance, visitorLink);
        } catch (Exception e) {
            log.error("Failed to send communication invite email for grievance ID: {}", grievance.getId(), e);
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
        inMemoryStore.put(id, grievance);
        try {
            grievanceRepository.save(grievance);
        } catch (Exception e) {
            log.warn("Mongo save on closeCommunication failed: {}", e.getMessage());
        }
    }

    public Page<Grievance> searchGrievances(String keyword, Pageable pageable) {
        try {
            Page<Grievance> page = grievanceRepository.searchByKeyword(keyword, pageable);
            if (page.hasContent()) return page;
        } catch (Exception e) {
            log.warn("Mongo search failed: {}", e.getMessage());
        }
        String lower = keyword.toLowerCase();
        return getInMemoryPage(pageable, g -> 
            (g.getName() != null && g.getName().toLowerCase().contains(lower)) ||
            (g.getLocation() != null && g.getLocation().toLowerCase().contains(lower)) ||
            (g.getOriginalGrievance() != null && g.getOriginalGrievance().toLowerCase().contains(lower)) ||
            (g.getAiSummary() != null && g.getAiSummary().toLowerCase().contains(lower))
        );
    }

    public Page<Grievance> findByStatus(GrievanceStatus status, Pageable pageable) {
        try {
            Page<Grievance> page = grievanceRepository.findByStatus(status, pageable);
            if (page.hasContent()) return page;
        } catch (Exception e) {
            log.warn("Mongo findByStatus failed: {}", e.getMessage());
        }
        return getInMemoryPage(pageable, g -> g.getStatus() == status);
    }

    public Page<Grievance> findByCategory(Category category, Pageable pageable) {
        try {
            Page<Grievance> page = grievanceRepository.findByCategory(category, pageable);
            if (page.hasContent()) return page;
        } catch (Exception e) {
            log.warn("Mongo findByCategory failed: {}", e.getMessage());
        }
        return getInMemoryPage(pageable, g -> g.getCategory() == category);
    }

    public Page<Grievance> findByUrgency(Urgency urgency, Pageable pageable) {
        try {
            Page<Grievance> page = grievanceRepository.findByUrgency(urgency, pageable);
            if (page.hasContent()) return page;
        } catch (Exception e) {
            log.warn("Mongo findByUrgency failed: {}", e.getMessage());
        }
        return getInMemoryPage(pageable, g -> g.getUrgency() == urgency);
    }

    private Page<Grievance> getInMemoryPage(Pageable pageable, java.util.function.Predicate<Grievance> filter) {
        List<Grievance> list = inMemoryStore.values().stream()
                .filter(filter)
                .sorted((a, b) -> {
                    Instant ta = a.getCreatedAt() != null ? a.getCreatedAt() : Instant.MIN;
                    Instant tb = b.getCreatedAt() != null ? b.getCreatedAt() : Instant.MIN;
                    return tb.compareTo(ta); // desc order (newest first)
                })
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), list.size());
        List<Grievance> subList = (start >= list.size()) ? Collections.emptyList() : list.subList(start, end);
        return new PageImpl<>(subList, pageable, list.size());
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
