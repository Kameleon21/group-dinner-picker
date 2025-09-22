package com.example.demo.repo;

import com.example.demo.domain.LockState;

import java.util.concurrent.atomic.AtomicReference;

public class InMemoryLockStateRepository implements LockStateRepository {

    private final AtomicReference<LockState> ref = new AtomicReference<>(new LockState());

    @Override
    public LockState get() {
        LockState current = ref.get();
        LockState copy = new LockState();
        copy.setLocked(current.isLocked());
        copy.setLockedAt(current.getLockedAt());
        return copy;
    }

    @Override
    public LockState save(LockState state) {
        LockState toStore = new LockState();
        toStore.setLocked(state.isLocked());
        toStore.setLockedAt(state.getLockedAt());
        ref.set(toStore);

        // return another copy
        LockState returned = new LockState();
        returned.setLocked(state.isLocked());
        returned.setLockedAt(state.getLockedAt());
        return returned;
    }
}
