package com.example.demo.repo;

import com.example.demo.domain.LockState;

public interface LockStateRepository {
    LockState get();

    LockState save(LockState lockState);
}
