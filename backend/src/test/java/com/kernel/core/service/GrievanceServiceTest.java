package com.kernel.core.service;

import com.kernel.core.dto.request.GrievanceSubmitRequest;
import com.kernel.core.dto.response.CommunicationEnableResponse;
import com.kernel.core.dto.response.GrievanceSubmitResponse;
import com.kernel.core.exception.ResourceNotFoundException;
import com.kernel.core.model.Grievance;
import com.kernel.core.model.enums.Category;
import com.kernel.core.model.enums.CommunicationStatus;
import com.kernel.core.model.enums.GrievanceStatus;
import com.kernel.core.model.enums.Urgency;
import com.kernel.core.repository.GrievanceRepository;
import com.kernel.core.service.session.CommunicationSession;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GrievanceServiceTest {

    @Mock
    private GrievanceRepository grievanceRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private AiService aiService;
    @Mock
    private CommunicationSessionService communicationSessionService;

    @InjectMocks
    private GrievanceService grievanceService;

    @Test
    void createGrievanceSavesWithCorrectStatus() throws Exception {
        GrievanceSubmitRequest request = new GrievanceSubmitRequest();
        request.setName("John");
        request.setLocation("Test");
        request.setEmail("test@test.com");
        request.setLanguage("en");
        request.setGrievance("Test grievance");
        
        Grievance saved = new Grievance();
        saved.setId("g-1");
        saved.setStatus(GrievanceStatus.NEW);
        
        when(grievanceRepository.save(any(Grievance.class))).thenReturn(saved);

        GrievanceSubmitResponse response = grievanceService.createGrievance(request);

        assertNotNull(response);
        assertEquals("g-1", response.getId());
        
        ArgumentCaptor<Grievance> captor = ArgumentCaptor.forClass(Grievance.class);
        verify(grievanceRepository).save(captor.capture());
        
        Grievance captured = captor.getValue();
        assertEquals(GrievanceStatus.NEW, captured.getStatus());
        assertEquals(CommunicationStatus.DISABLED, captured.getCommunicationStatus());
        assertEquals("Test grievance", captured.getOriginalGrievance());
    }

    @Test
    void createGrievanceDoesNotLoseGrievanceWhenEmailFails() throws Exception {
        GrievanceSubmitRequest request = new GrievanceSubmitRequest();
        request.setName("John");
        request.setLocation("Test");
        request.setEmail("test@test.com");
        request.setLanguage("en");
        request.setGrievance("Test grievance");
        
        Grievance saved = new Grievance();
        saved.setId("g-1");
        saved.setStatus(GrievanceStatus.NEW);
        
        when(grievanceRepository.save(any(Grievance.class))).thenReturn(saved);
        doThrow(new RuntimeException("Email failed")).when(emailService).sendGrievanceConfirmation(any(Grievance.class));

        // Should not throw
        grievanceService.createGrievance(request);
        
        verify(grievanceRepository).save(any(Grievance.class));
    }

    @Test
    void findByIdThrowsExceptionForNonexistentId() {
        when(grievanceRepository.findById("unknown")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> grievanceService.findById("unknown"));
    }

    @Test
    void updateStatusUpdatesCorrectly() {
        Grievance g = new Grievance();
        g.setId("g-1");
        g.setStatus(GrievanceStatus.NEW);
        
        when(grievanceRepository.findById("g-1")).thenReturn(Optional.of(g));
        when(grievanceRepository.save(any(Grievance.class))).thenReturn(g);
        
        grievanceService.updateStatus("g-1", GrievanceStatus.REVIEWING);
        
        assertEquals(GrievanceStatus.REVIEWING, g.getStatus());
        verify(grievanceRepository).save(g);
    }

    @Test
    void enableCommunicationGeneratesTokensAndSendsEmail() throws Exception {
        Grievance g = new Grievance();
        g.setId("g-1");
        g.setCommunicationStatus(CommunicationStatus.DISABLED);
        
        CommunicationSession session = new CommunicationSession("sess-1", "g-1", "vt", "at", Instant.now().plusSeconds(3600));
        
        when(grievanceRepository.findById("g-1")).thenReturn(Optional.of(g));
        when(communicationSessionService.createSession("g-1")).thenReturn(session);
        
        CommunicationEnableResponse response = grievanceService.enableCommunication("g-1", "http://backend");
        
        assertEquals("vt", response.getVisitorToken());
        assertEquals("at", response.getAdminToken());
        
        assertEquals(CommunicationStatus.ACTIVE, g.getCommunicationStatus());
        assertEquals("vt", g.getCommunicationToken());
        
        verify(emailService).sendCommunicationInvite(eq(g), anyString());
        verify(grievanceRepository).save(g);
    }

    @Test
    void closeCommunicationRemovesSessionAndUpdateGrievance() {
        Grievance g = new Grievance();
        g.setId("g-1");
        g.setCommunicationStatus(CommunicationStatus.ACTIVE);
        g.setCommunicationToken("vt");
        
        CommunicationSession session = new CommunicationSession("sess-1", "g-1", "vt", "at", Instant.now().plusSeconds(3600));
        
        when(grievanceRepository.findById("g-1")).thenReturn(Optional.of(g));
        when(communicationSessionService.getSessionByToken("vt")).thenReturn(session);
        
        grievanceService.closeCommunication("g-1");
        
        assertEquals(CommunicationStatus.CLOSED, g.getCommunicationStatus());
        assertNull(g.getCommunicationToken());
        
        verify(communicationSessionService).closeSession("sess-1");
        verify(grievanceRepository).save(g);
    }
}
