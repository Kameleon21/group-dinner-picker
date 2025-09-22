package com.example.demo.dto;

import com.example.demo.domain.LockState;
import com.example.demo.domain.Option;

public class DtoMapper {

    private DtoMapper() { }

    public static OptionResponse toOptionResponse(Option o) {
        return new OptionResponse(
            o.getId(),
            o.getName(),
            o.getLink(),
            o.getVotes(),
            o.getCreatedAt()
        );
    }

    public static LockResponse toLockResponse(LockState s) {
        return new LockResponse(s.isLocked(),s.getLockedAt());
    }
}
