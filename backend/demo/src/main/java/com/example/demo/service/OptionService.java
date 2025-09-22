package com.example.demo.service;

import com.example.demo.domain.Option;
import com.example.demo.dto.CreateOptionRequest;
import com.example.demo.dto.DtoMapper;
import com.example.demo.dto.OptionResponse;
import com.example.demo.dto.VoteRequest;
import com.example.demo.repo.OptionRepository;
import com.example.demo.service.exception.InvalidVoteDeltaException;
import com.example.demo.service.exception.OptionNotFoundException;
import com.example.demo.service.exception.VotingLockedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OptionService {
    private final OptionRepository optionRepo;
    private final LockService lockService;

    public OptionService(OptionRepository optionRepo, LockService lockService) {
        this.optionRepo = optionRepo;
        this.lockService = lockService;
    }

    public List<OptionResponse> listOptions() {
        return optionRepo.findAll().stream()
            .sorted(Comparator
                .comparingInt(Option::getVotes).reversed()
                .thenComparing(Option::getCreatedAt))
            .map(DtoMapper::toOptionResponse)
            .collect(Collectors.toList());
    }

    public OptionResponse getOption(UUID id) {
        Option o = optionRepo.findById(id).orElseThrow(() -> new OptionNotFoundException(id));
        return DtoMapper.toOptionResponse(o);
    }

    public OptionResponse createOption(CreateOptionRequest req) {
        if (lockService.isLocked()) {
            throw new VotingLockedException();
        }
        // Optional duplicate rule (enable if you created the exception)
        // if (optionRepo.existsByName(req.getName())) {
        //     throw new DuplicateOptionException(req.getName());
        // }

        Option toCreate = new Option(
            UUID.randomUUID(),
            req.getName(),
            req.getLink(),
            0,
            Instant.now()
        );
        Option saved = optionRepo.save(toCreate);
        return DtoMapper.toOptionResponse(saved);
    }

    public OptionResponse vote(VoteRequest req) {
        if (lockService.isLocked()) {
            throw new VotingLockedException();
        }
        int delta = req.getDelta();
        if (delta != 1 && delta != -1) {
            throw new InvalidVoteDeltaException(delta);
        }

        Option o = optionRepo.findById(req.getOptionId())
            .orElseThrow(() -> new OptionNotFoundException(req.getOptionId()));

        int newVotes = o.getVotes() + delta;
        if (newVotes < 0) newVotes = 0; // clamp at zero for Tier 1

        o.setVotes(newVotes);
        Option updated = optionRepo.save(o);
        return DtoMapper.toOptionResponse(updated);
    }

}
