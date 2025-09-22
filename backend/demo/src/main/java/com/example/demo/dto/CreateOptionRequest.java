package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CreateOptionRequest {
    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "link is required")
    @Pattern(
        regexp = "https?://.+",
        message = "link must start with http:// or https://"
    )
    private String link;

    public CreateOptionRequest() {}

    public CreateOptionRequest(String name, String link) {
        this.name = name;
        this.link = link;
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
}
