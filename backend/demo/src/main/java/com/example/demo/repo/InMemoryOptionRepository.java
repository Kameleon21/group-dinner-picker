package com.example.demo.repo;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.Option;

@Repository
public class InMemoryOptionRepository implements OptionRepository {
    private final ConcurrentMap<UUID, Option> store = new ConcurrentHashMap<>();

    @Override
    public List<Option> findAll() {
        // Return a defensive copy to avoid external mutation of the map’s values
        return store.values()
            .stream()
            .map(this::copy) // protect against external mutation
            .collect(Collectors.toUnmodifiableList());
    }

    @Override
    public Optional<Option> findById(UUID id) {
        Option found = store.get(id);
        return Optional.ofNullable(found == null ? null : copy(found));
    }

    @Override
    public Option save(Option option) {
        // Ensure id + createdAt exist; domain constructor usually sets these,
        // but we enforce here in case callers used the full constructor.
        UUID id = option.getId() != null ? option.getId() : UUID.randomUUID();
        option.setId(id);

        // Store an internal copy to avoid callers holding a reference to our stored object
        Option toStore = copy(option);
        store.put(id, toStore);

        // Return a fresh copy to the caller
        return copy(toStore);
    }

    @Override
    public boolean existsByName(String name) {
        if (name == null) return false;
        String needle = name.trim().toLowerCase(Locale.ROOT);
        return store.values().stream()
            .anyMatch(o -> o.getName() != null &&
                o.getName().trim().toLowerCase(Locale.ROOT).equals(needle));
    }

    @Override
    public void deleteById(UUID id) {
        store.remove(id);
    }

    @Override
    public void deleteAll() {
        store.clear();
    }

    @Override
    public long count() {
        return store.size();
    }

    private Option copy(Option o) {
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
