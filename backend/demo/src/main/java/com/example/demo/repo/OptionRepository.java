package com.example.demo.repo;

import com.example.demo.domain.Option;

import java.util.List;
import java.util.Optional;

public interface OptionRepository {

    List<Option> findAll();

    Optional<Option> findById(Long id);

    Option save(Option option);

    boolean existsByString(String string);
}
