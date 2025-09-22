package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

public class SetLockRequest {
    @NotNull(message = "locked is required")
    private boolean locked;

    public SetLockRequest() { }

    public SetLockRequest(boolean locked) { this.locked = locked; }

    public boolean isLocked() { return locked; }

    public void setLocked(boolean locked) { this.locked = locked; }
}
