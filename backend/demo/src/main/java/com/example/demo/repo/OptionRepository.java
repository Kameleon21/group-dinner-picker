package com.example.demo.repo;

import com.example.demo.domain.Option;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OptionRepository {

    List<Option> findAll();

    Optional<Option> findById(UUID id);

    Option save(Option option);

    boolean existsByName(String name);
}
