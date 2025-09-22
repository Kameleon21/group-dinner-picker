package com.example.demo.web;

import com.example.demo.dto.LockResponse;
import com.example.demo.dto.SetLockRequest;
import com.example.demo.service.LockService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lock")
public class LockController {
    private final LockService lockService;

    public LockController(LockService lockService) {
        this.lockService = lockService;
    }

    @GetMapping
    public LockResponse get() {
        return lockService.getLock();
    }

    @PostMapping
    public LockResponse set(@Valid @RequestBody SetLockRequest req) {
        return lockService.setLock(req.getLocked());
    }
}
