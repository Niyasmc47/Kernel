package com.kernel.core.exception;

public class CommunicationNotEnabledException extends RuntimeException {
    public CommunicationNotEnabledException(String message) {
        super(message);
    }
}
