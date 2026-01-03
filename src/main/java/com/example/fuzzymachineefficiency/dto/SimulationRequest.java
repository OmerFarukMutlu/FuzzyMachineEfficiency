package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class SimulationRequest {
    private Long machineId;
    private double targetProduction;
    private int deadlineDays;
    private double electricityCost;
    private double laborCostPerHour;
    private double maintenanceCostPerSession;

}