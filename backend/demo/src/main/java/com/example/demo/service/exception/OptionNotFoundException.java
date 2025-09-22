package com.example.demo.service.exception;

import java.util.UUID;

public class OptionNotFoundException extends RuntimeException {
    public OptionNotFoundException(UUID id) {
        super("Option not found: " + id);
    }
}
