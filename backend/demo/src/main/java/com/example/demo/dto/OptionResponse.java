package com.example.demo.dto;

import java.time.Instant;
import java.util.UUID;

public class OptionResponse {
    private UUID id;
    private String name;
    private String link;
    private int votes;
    private Instant createdAt;

    public OptionResponse() { }

    public OptionResponse(UUID id, String name, String link, int votes, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.link = link;
        this.votes = votes;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public int getVotes() {
        return votes;
    }

    public void setVotes(int votes) {
        this.votes = votes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
