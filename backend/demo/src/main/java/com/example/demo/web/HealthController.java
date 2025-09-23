package com.example.demo.web;

import java.time.Instant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.HealthResponse;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public HealthResponse getHealth() {
        return new HealthResponse(
            "UP", 
            Instant.now(), 
            "1.0.0"
        );
    }
}
