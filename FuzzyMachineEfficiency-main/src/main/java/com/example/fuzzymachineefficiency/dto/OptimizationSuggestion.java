package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class OptimizationSuggestion {
    private String parameter;
    private double currentValue;
    private double suggestedValue;
    private double potentialImprovementPercentage;
    private String reasonForSuggestion;
    private String implementationDifficulty;
    private double estimatedCostOfImplementation;
}