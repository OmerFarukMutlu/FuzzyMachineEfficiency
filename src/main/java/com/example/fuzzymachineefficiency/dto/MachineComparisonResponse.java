package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class MachineComparisonResponse {
    private List<MachineComparisonItem> comparisonResults;
    private MachineComparisonItem bestOverallPerformer;
    private Map<String, MachineComparisonItem> bestPerFactorPerformers;
    private List<ComparisonChart> charts;
}