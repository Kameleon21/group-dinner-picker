package com.example.demo.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ErrorResponse {
    private Instant timestamp = Instant.now();
    private String path;
    private int status;
    private String error;
    private String message;
    private List<FieldViolation> violations = new ArrayList<>();

    public Instant getTimestamp() { return timestamp; }
    public String getPath() { return path; }
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public List<FieldViolation> getViolations() { return violations; }

    public void setPath(String path) { this.path = path; }
    public void setStatus(int status) { this.status = status; }
    public void setError(String error) { this.error = error; }
    public void setMessage(String message) { this.message = message; }

    public static class FieldViolation {
        private String field;
        private String message;

        public FieldViolation() {}
        public FieldViolation(String field, String message) {
            this.field = field;
            this.message = message;
        }
        public String getField() { return field; }
        public String getMessage() { return message; }
        public void setField(String field) { this.field = field; }
        public void setMessage(String message) { this.message = message; }
    }
}
