package com.kernel.core.service;

import com.kernel.core.model.Grievance;

public interface EmailService {
    void sendGrievanceConfirmation(Grievance grievance);
    void sendCommunicationInvite(Grievance grievance, String visitorLink);
}
