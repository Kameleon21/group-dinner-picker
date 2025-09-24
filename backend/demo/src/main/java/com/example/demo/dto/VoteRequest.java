package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

public class VoteRequest {
    @NotNull(message = "optionId is required")
    private Long optionId;

    @NotNull(message = "delta is required")
    private Integer delta; // must be +1 or -1

    public VoteRequest() {}

    public VoteRequest(Long optionId, Integer delta) {
        this.optionId = optionId;
        this.delta = delta;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public Integer getDelta() {
        return delta;
    }

    public void setDelta(Integer delta) {
        this.delta = delta;
    }

}
