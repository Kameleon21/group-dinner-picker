package com.example.demo.repo;

import java.util.List;
import java.util.Optional;
import com.example.demo.domain.Option;

public interface OptionRepository {

    List<Option> findAll();

    Optional<Option> findById(Long id);

    Option save(Option option);

    boolean existsByName(String name);

    void deleteById(Long id);

    void deleteAll();

    long count();
}
