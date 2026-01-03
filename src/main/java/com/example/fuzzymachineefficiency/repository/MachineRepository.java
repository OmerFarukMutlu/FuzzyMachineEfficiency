package com.example.fuzzymachineefficiency.repository;

import com.example.fuzzymachineefficiency.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MachineRepository extends JpaRepository<Machine, Long> {
}