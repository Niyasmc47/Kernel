    package com.kernel.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kernel.core.dto.request.AdminLoginRequest;
import com.kernel.core.dto.response.AdminLoginResponse;
import com.kernel.core.security.JwtAuthenticationFilter;
import com.kernel.core.service.AdminAuthService;
import com.kernel.core.service.GrievanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc
class AdminControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminAuthService adminAuthService;

    @MockBean
    private GrievanceService grievanceService;

    @Test
    void getGrievancesWithoutAuthReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/grievances"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginDoesNotRequireAuth() throws Exception {
        AdminLoginRequest req = new AdminLoginRequest();
        req.setPassword("test");

        AdminLoginResponse mockResponse = new AdminLoginResponse();
        mockResponse.setToken("fake-jwt-token");
        mockResponse.setExpiresAt(Instant.now().plusSeconds(3600));

        when(adminAuthService.authenticate(anyString())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void getGrievanceByIdWithoutAuthReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/grievances/1"))
                .andExpect(status().isUnauthorized());
    }
}
