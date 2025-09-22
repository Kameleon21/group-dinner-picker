package com.example.demo.service.exception;

public class InvalidVoteDeltaException  extends RuntimeException {
    public InvalidVoteDeltaException(int delta) {
        super("delta must be +1 or -1, got: " + delta);
    }
}
