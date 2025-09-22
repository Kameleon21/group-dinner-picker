package com.example.demo.service;

import com.example.demo.domain.LockState;
import com.example.demo.dto.DtoMapper;
import com.example.demo.dto.LockResponse;
import com.example.demo.repo.LockStateRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class LockService {
    private final LockStateRepository lockRepo;

    public LockService(LockStateRepository lockRepo) {
        this.lockRepo = lockRepo;
    }

    public LockResponse getLock() {
        LockState state = lockRepo.get();
        return DtoMapper.toLockResponse(state);
    }

    public LockResponse setLock(boolean locked) {
        LockState state = lockRepo.get();
        state.setLocked(locked);
        if (locked) {
            state.setLockedAt(Instant.now());
        } else {
            state.setLockedAt(null);
        }
        LockState saved = lockRepo.save(state);
        return DtoMapper.toLockResponse(saved);
    }

    public boolean isLocked() {
        return lockRepo.get().isLocked();
    }
}
