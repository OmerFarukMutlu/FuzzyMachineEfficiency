package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class MachineComparisonItem {
    private Long machineId;
    private String machineName;
    private Map<String, Double> factorScores;
    private double overallScore;
    private List<String> strengths;
    private List<String> weaknesses;
}