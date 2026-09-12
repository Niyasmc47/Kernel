package com.kernel.core.dto.request;

import com.kernel.core.model.enums.GrievanceStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {
    @NotNull
    private GrievanceStatus status;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(GrievanceStatus status) {
        this.status = status;
    }

    public GrievanceStatus getStatus() {
        return status;
    }

    public void setStatus(GrievanceStatus status) {
        this.status = status;
    }
}
