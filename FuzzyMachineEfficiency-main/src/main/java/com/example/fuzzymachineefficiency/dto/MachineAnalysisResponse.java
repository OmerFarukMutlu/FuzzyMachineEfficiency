package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class MachineAnalysisResponse {
    private double EfficiencyScore;
    private String EfficiencyStatus;
}
