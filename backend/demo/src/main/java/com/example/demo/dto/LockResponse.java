package com.example.demo.dto;

import java.time.Instant;

public class LockResponse {
    private boolean locked;
    private Instant lockedAt;

    public LockResponse() { }

    public LockResponse(boolean locked, Instant lockedAt) {
        this.locked = locked;
        this.lockedAt = lockedAt;
    }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
    public Instant getLockedAt() { return lockedAt; }
    public void setLockedAt(Instant lockedAt) { this.lockedAt = lockedAt; }
}
