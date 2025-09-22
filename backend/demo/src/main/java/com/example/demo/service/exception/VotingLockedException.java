package com.example.demo.service.exception;

public class VotingLockedException extends RuntimeException {
    public VotingLockedException() {
        super("Voting is locked");
    }
}
