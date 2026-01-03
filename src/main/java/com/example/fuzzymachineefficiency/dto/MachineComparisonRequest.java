package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;

@Data
public class MachineComparisonRequest {
    private List<Long> machineIds;
    private List<String> comparisonFactors;
    private boolean includeHistoricalData;
    private Integer historicalMonths;
}