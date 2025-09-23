package com.example.demo.dto;

import java.time.Instant;

public class HealthResponse {
    private String status;
    private Instant timestamp;
    private String version;

    public HealthResponse() {}

    public HealthResponse(String status, Instant timestamp, String version) {
        this.status = status;
        this.timestamp = timestamp;
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
