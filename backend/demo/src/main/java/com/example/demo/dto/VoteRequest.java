package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class VoteRequest {
    @NotNull(message = "optionId is required")
    private UUID optionId;

    @NotNull(message = "delta is required")
    private Integer delta; // must be +1 or -1

    public VoteRequest() {}

    public VoteRequest(UUID optionId, Integer delta) {
        this.optionId = optionId;
        this.delta = delta;
    }

    public UUID getOptionId() {
        return optionId;
    }

    public void setOptionId(UUID optionId) {
        this.optionId = optionId;
    }

    public Integer getDelta() {
        return delta;
    }

    public void setDelta(Integer delta) {
        this.delta = delta;
    }

}
