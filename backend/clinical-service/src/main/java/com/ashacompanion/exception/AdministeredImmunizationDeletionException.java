package com.ashacompanion.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class AdministeredImmunizationDeletionException extends RuntimeException {
    public AdministeredImmunizationDeletionException(String message) {
        super(message);
    }
}
