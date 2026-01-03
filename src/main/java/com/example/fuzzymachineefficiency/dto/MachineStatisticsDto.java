package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class MachineStatisticsDto {
    private int totalMachines;
    private double averageEfficiencyScore;
    private MachineDto mostEfficientMachine;
    private MachineDto leastEfficientMachine;
    private Map<String, Integer> efficiencyDistribution;
    private double averageMaintenanceInterval;
    private double averageEnergyConsumption;
    private List<ChartData> efficiencyTrendByMonth;
    private List<ChartData> productionVsEfficiency;
}