package com.kernel.core.controller;

import com.kernel.core.dto.request.GrievanceSubmitRequest;
import com.kernel.core.dto.response.GrievanceSubmitResponse;
import com.kernel.core.service.GrievanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grievances")
public class GrievanceController {

    private final GrievanceService grievanceService;

    public GrievanceController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GrievanceSubmitResponse submitGrievance(@RequestBody @Valid GrievanceSubmitRequest request) {
        return grievanceService.createGrievance(request);
    }
}
