package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;

@Data
public class OptimizationResponse {
    private Long machineId;
    private String machineName;
    private double currentEfficiencyScore;
    private List<OptimizationSuggestion> suggestions;
    private OptimizedState potentialOptimizedState;
}