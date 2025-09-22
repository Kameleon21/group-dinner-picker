package com.example.demo.web;

import com.example.demo.dto.CreateOptionRequest;
import com.example.demo.dto.OptionResponse;
import com.example.demo.dto.VoteRequest;
import com.example.demo.service.OptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class OptionController {
    private final OptionService optionService;

    public OptionController(OptionService optionService) {
        this.optionService = optionService;
    }

    @GetMapping("/options")
    public List<OptionResponse> listOptions() {
        return optionService.listOptions();
    }

    @GetMapping("/options/{id}")
    public OptionResponse getOption(@PathVariable UUID id) {
        return optionService.getOption(id);
    }

    @PostMapping("/options")
    @ResponseStatus(HttpStatus.CREATED)
    public OptionResponse createOption(@Valid @RequestBody CreateOptionRequest request) {
        return optionService.createOption(request);
    }

    @PostMapping("/vote")
    public OptionResponse vote(@Valid @RequestBody VoteRequest request) {
        return optionService.vote(request);
    }
}
