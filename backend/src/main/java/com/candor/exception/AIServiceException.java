package com.candor.exception;

public class AIServiceException extends RuntimeException {
    public AIServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
