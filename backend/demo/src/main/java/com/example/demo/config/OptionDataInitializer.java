package com.example.demo.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.demo.domain.Option;
import com.example.demo.repo.OptionRepository;

@Component
public class OptionDataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(OptionDataInitializer.class);

    private final OptionRepository optionRepository;

    public OptionDataInitializer(OptionRepository optionRepository) {
        this.optionRepository = optionRepository;
    }

    @Override
    public void run(String... args) {
        if (optionRepository.count() > 0) {
            log.debug("Skipping seed data; options already present: {}", optionRepository.count());
            return;
        }

        List<OptionSeed> seeds = List.of(
            new OptionSeed("Taco Palace", "https://example.com/taco-palace", 7),
            new OptionSeed("Sushi Central", "https://example.com/sushi-central", 12),
            new OptionSeed("Pasta Junction", "https://example.com/pasta-junction", 5),
            new OptionSeed("Veggie Delight", "https://example.com/veggie-delight", 3),
            new OptionSeed("BBQ Barn", "https://example.com/bbq-barn", 9),
            new OptionSeed("Curry House", "https://example.com/curry-house", 4),
            new OptionSeed("Burger Works", "https://example.com/burger-works", 2),
            new OptionSeed("Ramen Nook", "https://example.com/ramen-nook", 6),
            new OptionSeed("Mediterranean Grill", "https://example.com/mediterranean-grill", 8),
            new OptionSeed("Street Tacos & Co.", "https://example.com/street-tacos", 1)
        );

        seeds.forEach(seed -> optionRepository.save(new Option(seed.name(), seed.link(), seed.votes())));
        log.info("Seeded {} default dinner options", seeds.size());
    }

    private record OptionSeed(String name, String link, int votes) {}
}
