package com.kernel.core.dto;

import com.kernel.core.dto.request.GrievanceSubmitRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GrievanceSubmitRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    void testValidRequest() {
        GrievanceSubmitRequest request = new GrievanceSubmitRequest();
        request.setSessionId("sess-123");
        request.setName("John Doe");
        request.setAge(30);
        request.setLocation("New York");
        request.setEmail("john@example.com");
        request.setLanguage("en");
        request.setGrievance("This is a valid grievance description that is long enough.");

        Set<ConstraintViolation<GrievanceSubmitRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testBlankName() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setName("");
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testNullAge() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setAge(null);
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testAgeBelowOne() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setAge(0);
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testAgeAbove150() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setAge(151);
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testInvalidEmail() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setEmail("invalid-email");
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testGrievanceTooShort() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setGrievance("Short");
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testGrievanceTooLong() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setGrievance("A".repeat(10001));
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testBlankLanguage() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setLanguage("");
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testBlankLocation() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setLocation("");
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void testBlankSessionId() {
        GrievanceSubmitRequest request = createValidRequest();
        request.setSessionId("");
        assertFalse(validator.validate(request).isEmpty());
    }

    private GrievanceSubmitRequest createValidRequest() {
        GrievanceSubmitRequest request = new GrievanceSubmitRequest();
        request.setSessionId("sess-123");
        request.setName("John Doe");
        request.setAge(30);
        request.setLocation("New York");
        request.setEmail("john@example.com");
        request.setLanguage("en");
        request.setGrievance("This is a valid grievance description that is long enough.");
        return request;
    }
}

