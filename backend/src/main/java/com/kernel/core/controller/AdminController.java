package com.kernel.core.controller;

import com.kernel.core.dto.request.AdminLoginRequest;
import com.kernel.core.dto.request.StatusUpdateRequest;
import com.kernel.core.dto.response.AdminGrievanceResponse;
import com.kernel.core.dto.response.AdminLoginResponse;
import com.kernel.core.dto.response.CommunicationEnableResponse;
import com.kernel.core.model.Grievance;
import com.kernel.core.model.enums.Category;
import com.kernel.core.model.enums.GrievanceStatus;
import com.kernel.core.model.enums.Urgency;
import com.kernel.core.service.AdminAuthService;
import com.kernel.core.service.GrievanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final GrievanceService grievanceService;
    private final String frontendUrl;

    public AdminController(AdminAuthService adminAuthService, GrievanceService grievanceService, @Value("${kernel.frontend.url:${FRONTEND_URL:http://localhost:3000}}") String frontendUrl) {
        this.adminAuthService = adminAuthService;
        this.grievanceService = grievanceService;
        this.frontendUrl = frontendUrl;
    }

    @PostMapping("/login")
    public AdminLoginResponse login(@RequestBody @Valid AdminLoginRequest request) {
        return adminAuthService.authenticate(request.getPassword());
    }

    @GetMapping("/grievances")
    public Page<AdminGrievanceResponse> getGrievances(
            @RequestParam(required = false) GrievanceStatus status,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Urgency urgency,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Grievance> grievances;

        if (search != null && !search.trim().isEmpty()) {
            grievances = grievanceService.searchGrievances(search, pageable);
        } else if (status != null) {
            grievances = grievanceService.findByStatus(status, pageable);
        } else if (category != null) {
            grievances = grievanceService.findByCategory(category, pageable);
        } else if (urgency != null) {
            grievances = grievanceService.findByUrgency(urgency, pageable);
        } else {
            grievances = grievanceService.findAll(pageable);
        }

        return grievances.map(this::mapToAdminGrievanceResponse);
    }

    @GetMapping("/grievances/{id}")
    public AdminGrievanceResponse getGrievance(@PathVariable String id) {
        Grievance grievance = grievanceService.findById(id);
        return mapToAdminGrievanceResponse(grievance);
    }

    @PatchMapping("/grievances/{id}/status")
    public AdminGrievanceResponse updateStatus(@PathVariable String id, @RequestBody @Valid StatusUpdateRequest request) {
        Grievance grievance = grievanceService.updateStatus(id, request.getStatus());
        return mapToAdminGrievanceResponse(grievance);
    }

    @PostMapping("/grievances/{id}/communication/enable")
    public CommunicationEnableResponse enableCommunication(@PathVariable String id) {
        return grievanceService.enableCommunication(id, frontendUrl);
    }

    @PostMapping("/grievances/{id}/communication/close")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void closeCommunication(@PathVariable String id) {
        grievanceService.closeCommunication(id);
    }

    private AdminGrievanceResponse mapToAdminGrievanceResponse(Grievance g) {
        return new AdminGrievanceResponse(
                g.getId(),
                g.getName(),
                g.getAge(),
                g.getLocation(),
                g.getEmail(),
                g.getLanguage(),
                g.getCategory() != null ? g.getCategory().name() : null,
                g.getUrgency() != null ? g.getUrgency().name() : null,
                g.getOriginalGrievance(),
                g.getAiSummary(),
                g.getStatus() != null ? g.getStatus().name() : null,
                g.getCreatedAt(),
                g.getUpdatedAt(),
                g.getCommunicationStatus() != null ? g.getCommunicationStatus().name() : null,
                g.getCommunicationEnabledAt(),
                g.getCommunicationClosedAt(),
                g.getVoiceNoteBase64(),
                g.getVoiceNoteContentType()
        );
    }
}
