package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class OptimizedState {
    private double potentialEfficiencyScore;
    private String potentialEfficiencyStatus;
    private double improvementPercentage;
    private double estimatedCostSavings;
    private int estimatedImplementationDays;
}