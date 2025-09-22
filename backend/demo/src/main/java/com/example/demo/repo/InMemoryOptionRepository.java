package com.example.demo.repo;

import com.example.demo.domain.Option;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

public class InMemoryOptionRepository implements OptionRepository {
    private final ConcurrentMap<UUID,Option> store = new ConcurrentHashMap<>();

    @Override
    public List<Option> findAll() {
        // prevent external mutation of the maps values
        return store.values()
            .stream()
            .map(this::copy) // to protect against external mutation
            .collect(Collectors.toUnmodifiableList());
    }

    @Override
    public Optional<Option> findById(Long id) {
        Option found = store.get(id);
        return Optional.ofNullable(found == null ? null : copy(found));
    }

    @Override
    public Option save(Option option) {
        UUID id = option.getId() != null ? option.getId() : UUID.randomUUID();
        option.setId(id);

        Option toStore = copy(option);
        store.put(id, toStore);

        // return fresh copy to the caller
        return copy(toStore);
    }

    @Override
    public boolean existsByString(String name) {
        if (name == null) return false;
        String needle = name.trim().toLowerCase(Locale.ROOT);
        return store.values().stream()
            .anyMatch(o -> o.getName() != null &&
             o.getName().trim().toLowerCase(Locale.ROOT).equals(needle));
    }

    private  Option copy(Option o) {
        Option c = new Option(
            o.getId(),
            o.getName(),
            o.getLink(),
            o.getVotes(),
            o.getCreatedAt()
        );
        return c;
    }
}
