package com.example.demo.domain;

import java.time.Instant;

public class LockState {
    private boolean locked;
    private Instant lockedAt;

   public LockState(boolean locked, Instant lockedAt) {
       this.locked = locked;
       this.lockedAt = lockedAt;
   }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
       this.locked = locked;
       this.lockedAt = locked ? Instant.now() : null;
    }

    public Instant getLockedAt() {
        return lockedAt;
    }

    public void setLockedAt(Instant lockedAt) {
        this.lockedAt = lockedAt;
    }
}
