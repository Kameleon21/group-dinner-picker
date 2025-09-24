package com.example.demo.domain;

import java.time.Instant;
public class Option {
    private Long id;
    private String name;
    private String link;
    private int votes;
    private Instant createdAt;

    public Option(Long id, String name, String link, int votes, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.link = link;
        this.votes = votes;
        this.createdAt = createdAt;
    }

    // constructor for new options ( id + createdAt generated here)
    public Option(String name, String link) {
        this(null, name, link, 0, Instant.now());
    }

    public Option(String name, String link, int votes) {
        this(null, name, link, votes, Instant.now());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    // Helper method for business later
    public void upvote() {
        this.votes++;
    }
    public void downvote() {
        this.votes--;
    }
}
