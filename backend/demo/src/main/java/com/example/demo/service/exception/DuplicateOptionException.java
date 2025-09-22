package com.example.demo.service.exception;

public class DuplicateOptionException extends RuntimeException {
    public DuplicateOptionException(String name){
        super("An option with this name already exists: " + name);
    }
}
