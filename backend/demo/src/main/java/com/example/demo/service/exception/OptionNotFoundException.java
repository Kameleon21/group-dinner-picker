package com.example.demo.service.exception;

public class OptionNotFoundException extends RuntimeException {
    public OptionNotFoundException(Long id) {
        super("Option not found: " + id);
    }
}
