package com.example.demo.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.LockService;
import com.example.demo.service.OptionService;

@RestController
@RequestMapping("/api/v1/session")
public class SessionController {
    private final OptionService optionService;
    private final LockService lockService;

    public SessionController(OptionService optionService, LockService lockService) {
        this.optionService = optionService;
        this.lockService = lockService;
    }

    @PostMapping("/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetSession() {
        // Reset voting lock to unlocked state
        lockService.setLock(false);
        // Clear all options
        optionService.resetAllOptions();
    }
}
