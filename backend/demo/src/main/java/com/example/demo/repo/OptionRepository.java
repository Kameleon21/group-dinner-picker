package com.example.demo.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.example.demo.domain.Option;

public interface OptionRepository {

    List<Option> findAll();

    Optional<Option> findById(UUID id);

    Option save(Option option);

    boolean existsByName(String name);

    void deleteById(UUID id);

    void deleteAll();

    long count();
}
